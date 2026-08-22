import chroma from "chroma-js";
import { uid } from "uid";
import type { ColorConfiguration } from "@yelbolt/engine-ui-color-palette";
import { makeDefaultShift } from "@yelbolt/engine-ui-color-palette";
import { getSupabase } from "ui-ui-color-palette/external/auth";
import { getPresets, getDefaultPreset } from "ui-ui-color-palette/stores";
import { doScale } from "@unoff/utils";
import { getPalette } from "./bridge/db";
import getPalettesOnCurrentPage from "./bridge/gets/getPalettesOnCurrentPage";
import jumpToPalette from "./bridge/gets/jumpToPalette";
import createPalette from "./bridge/creations/createPalette";
import createPaletteFromRemote from "./bridge/creations/createPaletteFromRemote";
import { dispatch, t } from "./bridge/context";
import webConfig from "./webConfig";

const parseColors = (raw: string): Array<{ hex: string }> =>
  raw
    .split(",")
    .map((hex) => hex.trim())
    .filter((hex) => chroma.valid(hex.startsWith("#") ? hex : `#${hex}`))
    .slice(0, webConfig.limits.sourceColors ?? 5)
    .map((hex) => ({ hex: hex.startsWith("#") ? hex : `#${hex}` }));

const fetchRemotePalette = async (id: string) => {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(webConfig.dbs.palettesDbViewName)
    .select("*")
    .eq("palette_id", id);

  if (error || !data || data.length === 0) return null;
  return data[0];
};

const buildFromParams = async (
  id: string | null,
  colorsParam: string,
  nameParam: string | null,
  presetParam: string | null,
) => {
  const hexes = parseColors(colorsParam);
  if (hexes.length === 0) return false;

  const preset =
    getPresets(t).find((p) => p.id === (presetParam ?? "").toUpperCase()) ??
    getDefaultPreset(t);

  const sourceColors = hexes.map(({ hex }, index) => {
    const gl = chroma(hex).gl();
    return {
      name: `Color ${index + 1}`,
      rgb: { r: gl[0], g: gl[1], b: gl[2] },
      source: "DEFAULT" as const,
      id: uid(),
      isRemovable: true,
    };
  });

  await createPalette({
    data: {
      id: id ?? undefined,
      sourceColors,
      exchange: {
        name: nameParam ?? t("settings.global.name.default"),
        description: "",
        preset,
        scale: doScale(preset.stops, preset.min, preset.max, preset.easing),
        shift: {
          chroma: makeDefaultShift("CHROMA"),
          hue: makeDefaultShift("HUE"),
        },
        areSourceColorsLocked: false,
        colorSpace: "LCH",
        visionSimulationMode: "NONE",
        textColorsTheme: { lightColor: "#FFFFFF", darkColor: "#000000" },
        algorithmVersion: webConfig.versions.algorithmVersion,
      },
    },
  });

  return true;
};

export const resolvePaletteFromUrl = async (search: string): Promise<void> => {
  const params = new URLSearchParams(search);
  const id = params.get("id");
  const colorsParam = params.get("colors");
  const nameParam = params.get("name");
  const presetParam = params.get("preset");

  if (!id && !colorsParam) return;

  if (id) {
    const local = await getPalette(id);
    if (local) {
      await jumpToPalette(id);
      return;
    }

    const remote = await fetchRemotePalette(id);
    if (remote) {
      await createPaletteFromRemote({
        data: {
          base: {
            name: remote.name,
            description: remote.description,
            preset: remote.preset,
            shift: remote.shift,
            areSourceColorsLocked: remote.are_source_colors_locked,
            colors: remote.colors as Array<ColorConfiguration>,
            colorSpace: remote.color_space,
            algorithmVersion: remote.algorithm_version,
          },
          themes: remote.themes,
          meta: {
            id: remote.palette_id,
            dates: {
              createdAt: remote.created_at,
              updatedAt: remote.updated_at,
              publishedAt: remote.published_at,
              // overwritten internally by createPaletteFromRemote with "now"
              openedAt: "",
            },
            publicationStatus: {
              isPublished: true,
              isShared: remote.is_shared,
            },
            creatorIdentity: {
              creatorFullName: remote.creator_full_name,
              creatorAvatar: remote.creator_avatar_url,
              creatorId: remote.creator_id,
            },
          },
        },
      });
      await getPalettesOnCurrentPage();
      return;
    }
  }

  if (colorsParam) {
    const built = await buildFromParams(
      id,
      colorsParam,
      nameParam,
      presetParam,
    );
    if (built) {
      await getPalettesOnCurrentPage();
      return;
    }
  }

  if (id)
    dispatch("POST_MESSAGE", {
      type: "ERROR",
      message: t("error.unfoundPalette"),
    });
};

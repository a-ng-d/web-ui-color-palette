import type { ColorConfiguration } from "@yelbolt/engine-ui-color-palette";
import { getSupabase } from "ui-ui-color-palette/external/auth";
import { getPalette } from "./bridge/db";
import getPalettesOnCurrentPage from "./bridge/gets/getPalettesOnCurrentPage";
import jumpToPalette from "./bridge/gets/jumpToPalette";
import createPaletteFromRemote from "./bridge/creations/createPaletteFromRemote";
import createPaletteFromLink, {
  type SharedPaletteData,
} from "./bridge/creations/createPaletteFromLink";
import { dispatch, t } from "./bridge/context";
import webConfig from "./webConfig";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RemotePaletteRow = any;

type RemoteFetchResult =
  | { status: "allowed"; row: RemotePaletteRow }
  | { status: "blocked" }
  | { status: "not-found" };

const fetchRemotePalette = async (
  id: string,
  currentUserId: string,
): Promise<RemoteFetchResult> => {
  const supabase = getSupabase();
  if (!supabase) return { status: "not-found" };

  const { data, error } = await supabase
    .from(webConfig.dbs.palettesDbViewName)
    .select("*")
    .eq("palette_id", id);

  if (error || !data || data.length === 0) return { status: "not-found" };

  const row = data[0];

  if (row.is_shared === true) return { status: "allowed", row };

  const isOwner = Boolean(currentUserId) && row.creator_id === currentUserId;
  if (isOwner) return { status: "allowed", row };

  return { status: "blocked" };
};

export type PaletteUrlResolution =
  | "resolved"
  | "blocked"
  | "not-found"
  | "no-op";

export const resolvePaletteFromUrl = async (
  search: string,
  currentUserId: string = "",
): Promise<PaletteUrlResolution> => {
  const params = new URLSearchParams(search);
  const id = params.get("id");
  const dataParam = params.get("data");

  if (!id && !dataParam) return "no-op";

  if (id) {
    const local = await getPalette(id);
    if (local) {
      await jumpToPalette(id);
      return "resolved";
    }
  }

  if (dataParam) {
    try {
      const payload = JSON.parse(dataParam) as SharedPaletteData;
      await createPaletteFromLink(payload);
      await getPalettesOnCurrentPage();
      return "resolved";
    } catch (error) {
      console.error("[urlPalette] Malformed data param:", error);
    }
  }

  if (id) {
    const result = await fetchRemotePalette(id, currentUserId);

    if (result.status === "allowed") {
      const remote = result.row;
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
      return "resolved";
    }

    if (result.status === "blocked") return "blocked";
  }

  dispatch("POST_MESSAGE", {
    type: "ERROR",
    message: t("error.unfoundPalette"),
  });
  return "not-found";
};

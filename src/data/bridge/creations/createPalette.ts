import { uid } from "uid";
import type {
  ColorConfiguration,
  Data,
  ExchangeConfiguration,
  SourceColorConfiguration,
  ThemeConfiguration,
} from "@yelbolt/engine-ui-color-palette";
import { Data as PaletteData } from "@yelbolt/engine-ui-color-palette";
import { setPalette } from "../db";
import { dispatch } from "../context";

interface Msg {
  data: {
    sourceColors: Array<SourceColorConfiguration>;
    exchange: ExchangeConfiguration;
    id?: string;
  };
}

const createPalette = async (msg: Msg) => {
  const colors: Array<ColorConfiguration> = msg.data.sourceColors
    .map((sourceColor) => ({
      name: sourceColor.name,
      description: "",
      rgb: sourceColor.rgb,
      id: uid(),
      hue: {
        shift: msg.data.exchange.shift.hue,
        isLocked: false,
      },
      chroma: {
        shift: msg.data.exchange.shift.chroma,
        isLocked: false,
      },
      alpha: {
        isEnabled: false,
        backgroundColor: "#FFFFFF",
      },
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const themes: Array<ThemeConfiguration> = [
    {
      name: "",
      description: "",
      scale: msg.data.exchange.scale,
      paletteBackground: "#FFFFFF",
      visionSimulationMode: msg.data.exchange.visionSimulationMode,
      textColorsTheme: msg.data.exchange.textColorsTheme,
      isEnabled: true,
      id: "00000000000",
      type: "default theme",
    },
  ];

  const now = new Date().toISOString();

  const palette = new PaletteData({
    base: {
      name: msg.data.exchange.name,
      description: msg.data.exchange.description,
      preset: msg.data.exchange.preset,
      shift: msg.data.exchange.shift,
      areSourceColorsLocked: msg.data.exchange.areSourceColorsLocked,
      colors,
      colorSpace: msg.data.exchange.colorSpace,
      algorithmVersion: msg.data.exchange.algorithmVersion,
    },
    themes,
    meta: {
      id: msg.data.id ?? uid(),
      dates: {
        createdAt: now,
        updatedAt: now,
        publishedAt: "",
        openedAt: now,
      },
      creatorIdentity: {
        creatorId: "",
        creatorFullName: "",
        creatorAvatar: "",
      },
      publicationStatus: {
        isShared: false,
        isPublished: false,
      },
    },
  }).makePaletteFullData();

  await setPalette(palette);
  dispatch("LOAD_PALETTE", palette);

  return palette.meta.id;
};

export default createPalette;

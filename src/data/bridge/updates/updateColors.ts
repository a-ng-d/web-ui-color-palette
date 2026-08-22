import type { FullConfiguration } from "@yelbolt/engine-ui-color-palette";
import type { ColorsMessage } from "ui-ui-color-palette/types";
import { getPalette, setPalette } from "../db";
import { dispatch } from "../context";

const updateColors = async (msg: ColorsMessage) => {
  const now = new Date().toISOString();
  const palette: FullConfiguration =
    (await getPalette(msg.id)) ?? ({} as FullConfiguration);

  palette.base.colors = msg.data;

  palette.meta.dates.updatedAt = now;
  dispatch("UPDATE_PALETTE_DATE", now);

  return setPalette(palette);
};

export default updateColors;

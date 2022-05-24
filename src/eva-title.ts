import { canvasRGBA } from "stackblur-canvas";

class EvaSettings {
  seed: number = Math.random();
  dark_mode: boolean;
  top_text: string;
  top_text_caps: boolean;
  mid_text: string;
  mid_text_caps: boolean;
  bot_text: string;
  bot_text_caps: boolean;
  ep_text: string;
  ep_text_caps: boolean;
  title_text: string;
  title_text_caps: boolean;
  title_align: string; // 'left'|'center'|'right'
  left_margin: number;
  right_boundary: number;
  sm_head_size: number;
  lg_head_size: number;
  ep_size: number;
  title_size: number;
  canvas_width: number;
  canvas_height: number;
  max_width: number;

  getTopText(): string {
    return this.top_text_caps ? this.top_text.toUpperCase() : this.top_text;
  }
  getMidText(): string {
    return this.mid_text_caps ? this.mid_text.toUpperCase() : this.mid_text;
  }
  getBotText(): string {
    return this.bot_text_caps ? this.bot_text.toUpperCase() : this.bot_text;
  }
  getEpText(): string {
    return this.ep_text_caps ? this.ep_text.toUpperCase() : this.ep_text;
  }
  getTitleText(): string {
    return this.title_text_caps
      ? this.title_text.toUpperCase()
      : this.title_text;
  }

  reseed(): void {
    this.seed = Math.random();
  }
  
  getColorTint(): string {
    const tints = [
        // "#FEF7E7",
        // "#FDF6E3",
        // "#FEF7E7",
        // "#FEF8EA",
        "#FEFAEE",
        "#FEFBF1",
        "#FEFCF5",
        "#FFFDF8",
        "#FFFEFC",
        "#F6FDFF",
        "#F7FEFF",
        "#F8FEFF",
        "#FAFEFF",
        "#FFFFFF"
        // "#FBFEFF",
        // "#FCFEFF",
        // "#FDFFFF",
        // "#FEFFFF",
      ],
      i = Math.floor(this.seed * tints.length);
    return tints[i];
  }

  getBgColor(): string {
    return this.dark_mode ? "#000000" : this.getColorTint();
  }

  getFgColor(): string {
    return this.dark_mode ? this.getColorTint() : "#000000";
  }
}

const settings = new EvaSettings();
console.log(`settings: ${settings}`);

function config(settings: EvaSettings): EvaSettings {
  // Read input fields:
  settings.dark_mode = (<HTMLInputElement>(
    document.getElementById("darkMode")
  )).checked;
  settings.top_text = (<HTMLInputElement>(
    document.getElementById("topText")
  )).value;
  settings.top_text_caps = (<HTMLInputElement>(
    document.getElementById("topTextCaps")
  )).checked;
  settings.mid_text = (<HTMLInputElement>(
    document.getElementById("midText")
  )).value;
  settings.mid_text_caps = (<HTMLInputElement>(
    document.getElementById("midTextCaps")
  )).checked;
  settings.bot_text = (<HTMLInputElement>(
    document.getElementById("botText")
  )).value;
  settings.bot_text_caps = (<HTMLInputElement>(
    document.getElementById("botTextCaps")
  )).checked;
  settings.ep_text = (<HTMLInputElement>(
    document.getElementById("epText")
  )).value;
  settings.ep_text_caps = (<HTMLInputElement>(
    document.getElementById("epTextCaps")
  )).checked;
  settings.title_text = (<HTMLInputElement>(
    document.getElementById("titleText")
  )).value;
  settings.title_text_caps = (<HTMLInputElement>(
    document.getElementById("titleTextCaps")
  )).checked;
  settings.title_align = (<HTMLInputElement>(
    document.getElementById("titleAlign")
  )).value;

  // 4:3 @ 900x675
  settings.canvas_width = 900;
  settings.canvas_height = 675;
  settings.left_margin = (settings.canvas_width * 1) / 15;
  settings.right_boundary = settings.canvas_width - settings.left_margin;

  settings.sm_head_size = settings.canvas_height * 0.188;
  settings.lg_head_size = settings.canvas_height * 0.308;
  settings.ep_size = settings.canvas_height * 0.095;
  settings.title_size = settings.canvas_height * 0.095;
  settings.max_width = settings.right_boundary - settings.left_margin;

  return settings;
}

export function draw(can: HTMLCanvasElement, config: EvaSettings): void {
  const ctx = can.getContext("2d");
  const topText = config.getTopText(),
    midText = config.getMidText(),
    botText = config.getBotText(),
    epText = config.getEpText(),
    titleText = config.getTitleText(),
    titleAlign = config.title_align,
    smHeadSize = config.sm_head_size,
    lgHeadSize = config.lg_head_size,
    epSize = config.ep_size,
    titleSize = config.title_size,
    // these all squash/condense the text horizontally
    topSquash = 0.62,
    midSquash = 0.62,
    botSquash = 1, // fit to maxWidth
    epSquash = 0.76,
    titleSquash = 0.74;

  const addText = addFittedText.bind(null, ctx, config);

  // black background
  // standard @ 900*675
  can.width = config.canvas_width;
  can.height = config.canvas_height;
  ctx.fillStyle = config.getBgColor();
  ctx.fillRect(0, 0, can.width, can.height);

  // Drawing white text with white stroke and neon shadow
  ctx.fillStyle = config.getFgColor();
  ctx.strokeStyle = config.getFgColor();
  ctx.textBaseline = "top";
  ctx.shadowColor = "orange";
  ctx.shadowBlur = 6;

  // Top two lines
  ctx.font = `900 ${smHeadSize}px "Times New Roman",serif`;
  addText(topText, can.height * 0.06667, topSquash);
  addText(midText, can.height * 0.21926, midSquash);
  // Bigger third line
  ctx.font = `900 ${lgHeadSize}px "Times New Roman",serif`;
  addText(botText, can.height * 0.35852, botSquash);

  // Change font for EPISODE: label
  ctx.font = `700 ${epSize}px sans-serif`;
  addText(epText, can.height * 0.62963, epSquash);

  // Change font for Title
  ctx.font = `600 ${titleSize}px "Times New Roman",serif`;
  addText(titleText, can.height * 0.78519, titleSquash, titleAlign);
  canvasRGBA(can, 0, 0, can.width, can.height, 1);
}

export function addFittedText(
  ctx: CanvasRenderingContext2D,
  config: EvaSettings,
  text: string,
  y: number,
  squash: number,
  align: "left" | "center" | "right" = "left"
): void {
  let x;

  if (align == "right") {
    ctx.textAlign = "right";
    x = config.right_boundary;
  } else if (align == "left") {
    ctx.textAlign = "left";
    x = config.left_margin;
  } else if (align == "center") {
    ctx.textAlign = "center";
    x = (config.right_boundary + config.left_margin) / 2;
  } else {
    x = align;
  }

  const toDraw = text.split("\n");
  if (toDraw.length > 1) ctx.textBaseline = "middle";

  for (let n = 0; n < toDraw.length; n++) {
    const mWidth = ctx.measureText("M").width;
    // Use maximum available space (if set)
    // or squashed width by ratio
    let widthCalc = ctx.measureText(toDraw[n]).width;
    widthCalc =
      widthCalc * squash >= config.max_width
        ? config.max_width
        : widthCalc * squash;
    // we're not stroking text for now, weird artifacts.
    // ctx.strokeText(toDraw[n], x, y+(n*mWidth), widthCalc);
    ctx.fillText(toDraw[n], x, y + n * mWidth, widthCalc);
  }

  // reset to "reasonable" defaults
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
}

export function generate(): void {
  const can = <HTMLCanvasElement>document.getElementById("eva-title");
  draw(can, config(settings));
}

export function download_img(anchor: HTMLAnchorElement): void {
  generate();
  const can = <HTMLCanvasElement>document.getElementById("eva-title");
  anchor.href = can.toDataURL("image/png");
}

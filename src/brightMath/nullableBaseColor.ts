import CMYKColor from './cmykColor';
import { IBaseColor, IHSVColor, IHSVShortColor, IRGBColor, IRGBAColor, IRGBShortColor, IRGBAShortColor, ICMYKColor, ICMYKShortColor, isCMYKColor, isCMYKShortColor, isHSVColor, isHSVShortColor, isRGBAColor, isRGBAShortColor, isRGBColor, isRGBShortColor, IColorDTO } from './interfaces';
import { EColorChannel, EColorSpace } from './enumerations';
import RGBColor from './rgbColor';
import RGBAColor from './rgbaColor';
import { getColorChannelIndex, getColorChannelCount, getColorChannelType } from './maps';
import NotImplementedError from './notImplementedError';

export default abstract class NullableBaseColor implements IBaseColor {
  public readonly sourceColorBase: EColorSpace;
  public readonly channelData: Array<bigint>;
  public readonly bitDepth: number;
  public readonly maxValue: bigint;
  public readonly isNull: boolean;
  public validate (): boolean {
    return this.validateBitDepth();
  }

  private validateBitDepth (): boolean {
    // currently only 8 bit/256 color depth is supported
    return (this.bitDepth === 8);
  }

  public constructor (sourceColorBase: EColorSpace, bitDepth: number, isNull: boolean) {
    this.isNull = isNull;
    this.sourceColorBase = sourceColorBase;
    this.maxValue = 2n ** BigInt(bitDepth) - 1n;
    this.bitDepth = bitDepth;
    if (!this.validateBitDepth()) {
      throw new Error('Invalid bit depth');
    }
    
    this.channelData = new Array<bigint>();
    for (let i = 0; i < this.getChannelCount(); i++) {
        this.channelData.push(0n);
    }
  }
  public abstract to: (other: EColorSpace) => NullableBaseColor;
  public getChannelData(channel: EColorChannel): bigint
  {
    return this.channelData[getColorChannelIndex(this.sourceColorBase, channel)];
  }
  public getChannelType(channelIndex: number): EColorChannel
  {
    return getColorChannelType(this.sourceColorBase, channelIndex);
  }
  public getChannelIndex(channel: EColorChannel): number {
    return getColorChannelIndex(this.sourceColorBase, channel);
  }
  public getChannelCount(): number {
    return getColorChannelCount(this.sourceColorBase);
  }

  public static fromObject (value: IRGBColor | IRGBShortColor | IRGBAColor | IRGBAShortColor | ICMYKColor | ICMYKShortColor | IHSVColor | IHSVShortColor): RGBColor | RGBAColor | CMYKColor {
    if (isRGBAColor(value)) {
      const rgbaValue = value as IRGBAColor;
      return new RGBAColor(value.bitDepth, rgbaValue.red, rgbaValue.green, rgbaValue.blue, rgbaValue.alpha);
    } else if (isRGBColor(value)) {
      const rgbValue = value as IRGBColor;
      return new RGBColor(value.bitDepth, rgbValue.red, rgbValue.green, rgbValue.blue);
    } else if (isRGBAShortColor(value)) {
      const rgbaValue = value as IRGBAShortColor;
      return new RGBAColor(value.bitDepth, rgbaValue.r, rgbaValue.g, rgbaValue.b, rgbaValue.a);
    } else if (isRGBShortColor(value)) {
      const rgbValue = value as IRGBShortColor;
      return new RGBColor(value.bitDepth, rgbValue.r, rgbValue.g, rgbValue.b);
    } else if (isCMYKColor(value)) {
      const cmykValue = value as ICMYKColor;
      return new CMYKColor(value.bitDepth, cmykValue.cyan, cmykValue.magenta, cmykValue.yellow, cmykValue.black);
    } else if (isCMYKShortColor(value)) {
      const cmykValue = value as ICMYKShortColor;
      return new CMYKColor(value.bitDepth, cmykValue.c, cmykValue.m, cmykValue.y, cmykValue.k);
    } else if (isHSVColor(value)) {
      throw new NotImplementedError();
      //const hsvValue = value as IHSVColor;
      //return new HSVColor(value.bitDepth, hsvValue.hue, hsvValue.saturation, hsvValue.value);
    } else if (isHSVShortColor(value)) {
      throw new NotImplementedError();
      //const hsvValue = value as IHSVShortColor;
      //return new HSVColor(value.bitDepth, hsvValue.h, hsvValue.s, hsvValue.v);
    } else {
      throw new Error('Invalid color type');
    }
  }

  public toObject (short: boolean): IColorDTO {
    if (this instanceof RGBColor) {
      if (short) {
        return {
          bitDepth: this.bitDepth,
          sourceColorBase: EColorSpace.RGB,
          r: this.red,
          g: this.green,
          b: this.blue,
        } as IRGBShortColor;
      } else {
        return {
          bitDepth: this.bitDepth,
          sourceColorBase: EColorSpace.RGB,
          red: this.red,
          green: this.green,
          blue: this.blue,
        } as IRGBColor;
    }
    } else if (this instanceof RGBAColor) {
      if (short) {
        return {
          bitDepth: this.bitDepth,
          sourceColorBase: EColorSpace.RGB,
          r: this.red,
          g: this.green,
          b: this.blue,
          a: this.alpha,
        } as IRGBAShortColor;
      } else {
      return {
        bitDepth: this.bitDepth,
        sourceColorBase: EColorSpace.RGB,
        red: this.red,
        green: this.green,
        blue: this.blue,
        alpha: this.alpha,
      } as IRGBAColor;
    }
    } else if (this instanceof CMYKColor) {
      if (short) {
        return {
          bitDepth: this.bitDepth,
          sourceColorBase: EColorSpace.CMYK,
          c: this.cyan,
          m: this.magenta,
          y: this.yellow,
          k: this.black,
        } as ICMYKShortColor;
      } else {
      return {
        bitDepth: this.bitDepth,
        sourceColorBase: EColorSpace.CMYK,
        cyan: this.cyan,
        magenta: this.magenta,
        yellow: this.yellow,
        black: this.black,
      } as ICMYKColor;
    }
    } else {
      throw new Error('Invalid color base');
    }
  }

  public abstract xor (other: NullableBaseColor): NullableBaseColor;

  public abstract add (other: NullableBaseColor): NullableBaseColor;

  public abstract subtract (other: NullableBaseColor): NullableBaseColor;

  public abstract multiply (other: NullableBaseColor): NullableBaseColor;

  public abstract divide (other: NullableBaseColor): NullableBaseColor;
}

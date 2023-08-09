///////////////////////////////////////////////////////////////
// CARAT, Gesellschaft für Organisation und Softwareentwicklung
// mbH & Co. Systemberatung KG
//
// Datei : color.component.ts
// erstellt : 09.05.2023
// Autor(en) : Matus Jiri
//
//////////////////////////////////////////////////////////////


import { Component } from '@angular/core';
import { ColorPickerService, Hsla, OutputFormat, Rgba } from 'ngx-color-picker';
import { ContextService, IconState } from '../../services/context.service';
import { CardInterface } from '../../interfaces/card';

export interface ColorMap {
  [key: string]: string;
}

@Component({
  selector: 'app-color',
  templateUrl: './color.component.html',
  styleUrls: ['./color.component.scss']
})

export class ColorComponent
{
  private _isColorVisible:boolean = false;
  private card?:CardInterface;
  colorValue:string = "#000000";
  colorModel:OutputFormat = "hex";  
  colorPart1:string = this.colorValue;
  colorPart2:string = "";
  colorPart3:string = "";


  /////////////////////////////////////////////////////////////////////
  // Status: E[09.05.2023], JM
  constructor(private context:ContextService, private colorPicker:ColorPickerService)
  {
    window.addEventListener("ColorChangeMessage", (event) => {
      this.card = ((event as CustomEvent).detail as CardInterface);
      if (this.card.color)
        this.onColorChange(this.card.color);

      this._isColorVisible = true;
    });
  }


  /////////////////////////////////////////////////////////////////////
  // Status: E[09.05.2023], JM
  get isColorVisible():boolean
  {
    return this._isColorVisible;
  }


  /////////////////////////////////////////////////////////////////////
  // Status: E[09.05.2023], JM
  onColorButtonClick(): void
  {
    this.card = undefined;
    this._isColorVisible = ! this._isColorVisible;
  }


  /////////////////////////////////////////////////////////////////////
  // Status: E[14.05.2023], JM
  protected hexToRgba(hex:string):Rgba
  {
    let num:number = parseInt(hex.replace("#", "0x"), 16);
    return new Rgba((num >> 16) & 255, (num >> 8) & 255, num  & 255, 0);
  }  


  /////////////////////////////////////////////////////////////////////
  // Status: E[14.05.2023], JM
  protected roundString(value:number):string
  {
    return Math.round(value).toString();
  }


  /////////////////////////////////////////////////////////////////////
  // Status: E[14.05.2023], JM
  onColorChange(color:string):void
  {
    this.colorValue = color;
    let rgb:Rgba = this.hexToRgba(this.colorValue);

    switch (this.colorModel)
    {
      case "hex":
      {
        this.colorPart1 = this.colorPicker.rgbaToHex(rgb);
        return;
      }

      case "rgba":
      {
        this.colorPart1 = this.roundString(rgb.r);
        this.colorPart2 = this.roundString(rgb.g);
        this.colorPart3 = this.roundString(rgb.b);
        return;
      }

      case "hsla":
      {
        rgb = new Rgba(rgb.r / 255, rgb.g / 255, rgb.b / 255, 0);
        let hsl = this.colorPicker.hsva2hsla(this.colorPicker.rgbaToHsva(rgb));
        this.colorPart1 = this.roundString(hsl.h * 360);
        this.colorPart2 = this.roundString(hsl.s * 100);
        this.colorPart3 = this.roundString(hsl.l * 100);
      }
    }
  }


  /////////////////////////////////////////////////////////////////////
  // Status: E[14.05.2023], JM
  onColorModelChange():void
  {
    this.onColorChange(this.colorValue);
  }


  /////////////////////////////////////////////////////////////////////
  // Status: E[14.05.2023], JM
  protected numberPart(value:string, min:number, max:number):number
  {
    let result:number = Number(value);
    return (Number.isNaN(result) || (result < min) || (result > max)) ? NaN : result;
  }


  /////////////////////////////////////////////////////////////////////
  // Status: E[14.05.2023], JM
  onColorInput():void
  {
    switch (this.colorModel)
    {
      case "hex":
      {
        this.colorValue = this.colorPart1;
        return;
      }

      case "rgba":
      {
        let rgb:Rgba = new Rgba(
          this.numberPart(this.colorPart1, 0, 255),
          this.numberPart(this.colorPart2, 0, 255),
          this.numberPart(this.colorPart3, 0, 255),
          0
        );
        this.colorValue = this.colorPicker.rgbaToHex(rgb);
        return;
      }

      case "hsla":
      {
        let hsl:Hsla = new Hsla(
          this.numberPart(this.colorPart1, 0, 359) / 360,
          this.numberPart(this.colorPart2, 0, 100) / 100,
          this.numberPart(this.colorPart3, 0, 100) / 100,
          0
        );
        this.colorValue = this.colorPicker.rgbaToHex(
          this.colorPicker.denormalizeRGBA(
            this.colorPicker.hsvaToRgba(
              this.colorPicker.hsla2hsva(hsl)
            )
          )
        );
        return;
      }
    }
  }


  /////////////////////////////////////////////////////////////////////
  // Status: E[09.05.2023], JM
  getIconStateColor():string
  {
    return this.context.getIconState(this._isColorVisible ? IconState.isActive : IconState.isDefault);
  }

  /////////////////////////////////////////////////////////////////////
  // Status: E[14.05.2023], JM
  onApply():void
  {
    this.context.cardColorInsertUpdate(this.card, this.colorValue);
    this.onColorButtonClick();
  }


  /////////////////////////////////////////////////////////////////////
  // Status: E[17.05.2023], JM
  onOutsideClick(event:MouseEvent):void
  {
    if (this.context.isFormTrigger(event, "form-color"))
      return;

    this._isColorVisible = false;
  }
}

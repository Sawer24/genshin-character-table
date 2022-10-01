export class TableData {
    Legends: Array<TableLegend>;
    Characters: Array<Character>;

  constructor (legends: Array<TableLegend>, characters: Array<Character>) {
    this.Legends = legends;
    this.Characters = characters;
  }
}

export class TableLegend {
    Id: string;
    Name: string;
    Names: Array<string>;
    Property: string;
    View: string;

    constructor (id: string, name: string, names: Array<string>, property: string, view: string){
        this.Id = id;
        this.Name = name;
        this.Names = names;
        this.Property = property;
        this.View = view;
    }
}

export class Character {
  Name: string;
  Version: string;
  Region: string;
  Element: string;
  Weapon: string;
  Rarity: string;
  Gender: string;
  Model: string;

  [key: string]: string;

  constructor( name: string, version: string, region: string, element: string, weapon: string, rarity: string, gender: string, model: string) {
    this.Name = name;
    this.Version = version;
    this.Region = region;
    this.Element = element;
    this.Weapon = weapon;
    this.Rarity = rarity;
    this.Gender = gender;
    this.Model = model;
  }
}

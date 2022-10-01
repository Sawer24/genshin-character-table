<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { TableData, TableLegend } from './models/Data';
import { Config } from './models/Config';
import { TableItem } from './models/TableItem';
import { computed } from '@vue/reactivity';

const error = ref<string>();
const data = ref<TableData>();
const config = ref<Config>();

const table = ref<TableItem[][]>();

const availableLegends = computed(() => data.value?.Legends.filter(l => !config.value?.Cols.includes(l) && !config.value?.Rows.includes(l)));

onMounted(async () => {
  const dataResponse = await fetch("data.json");
  if (!dataResponse.ok) {
    error.value = "Table data not found";
    return;
  }
  try {
    data.value = await dataResponse.json() as TableData;
  }
  catch {
    error.value = "Table data parse error";
    return;
  }
  if (!data.value || !data.value.Legends || !data.value.Characters) {
    error.value = "Table data format error";
    return;
  }
  const configResponse = await fetch("config.json");
  if (configResponse.ok)
  try{
    config.value = await configResponse.json() as Config;
  }
  catch {
    error.value = "Config parse error";
    return;
  }
  else {
    config.value = new Config([], []);//new Legend("element"), new Legend("gender")], [new Legend("weapon"), new Legend("rarity")]);
    const elementLegend = data.value.Legends.find(l => l.Id == "element"); if (elementLegend) config.value.Cols.push(elementLegend);
    const genderLegend = data.value.Legends.find(l => l.Id == "gender"); if (genderLegend) config.value.Cols.push(genderLegend);
    const weaponLegend = data.value.Legends.find(l => l.Id == "weapon"); if (weaponLegend) config.value.Rows.push(weaponLegend);
    const rarityLegend = data.value.Legends.find(l => l.Id == "rarity"); if (rarityLegend) config.value.Rows.push(rarityLegend);
  }
  updateTable();
});

function addLegend(legend: TableLegend, isRow: boolean) {
  const legends = isRow ? config.value?.Rows : config.value?.Cols;
  legends?.push(legend);
  updateTable();
}

function removeLegend(legend: TableLegend, isRow: boolean) {
  const legends = isRow ? config.value?.Rows : config.value?.Cols;
  legends?.splice(legends.indexOf(legend), 1);
  updateTable();
}

function updateTable() {
  const cols = config.value?.Cols ?? [];
  const rows = config.value?.Rows ?? [];
  table.value = [];
  
  const colCounts : Array<number>  = [];
  for (var i = 0; i < cols.length; i++)
      colCounts[i] = cols[i].Names.length;

  const colSpans : Array<number> = [];
  colSpans[cols.length - 1] = 1;
  for (var i = cols.length - 2; i >= 0; i--)
      colSpans[i] = colSpans[i + 1] * colCounts[i + 1];

  const colMult  : Array<number> = [];
  colMult[0] = 1;
  for (var i = 1; i < cols.length; i++)
      colMult[i] = colMult[i - 1] * colCounts[i - 1];

  const rowCounts : Array<number>  = [];
  for (var i = 0; i < rows.length; i++)
    rowCounts[i] = rows[i].Names.length;

  const rowSpans : Array<number>  = [];
  rowSpans[rows.length - 1] = 1;
  for (var i = rows.length - 2; i >= 0; i--)
    rowSpans[i] = rowSpans[i + 1] * rowCounts[i + 1];

  const rowMult : Array<number>  = [];
  rowMult[0] = 1;
  for (var i = 1; i < rows.length; i++)
    rowMult[i] = rowMult[i - 1] * rowCounts[i - 1];

  console.log(colCounts, colSpans, colMult);
  console.log(rowCounts, rowSpans, rowMult);

  const set = (x: number, y: number, value: TableItem) => {
    if (!table.value![y])
      table.value![y] = [];
    table.value![y]![x] = value;
  }
  const contains = (x: number, y: number): boolean => {
    if (!table.value![y])
      return false;
    if (!table.value![y][x])
      return false;
    return true;
  }

  if (rowCounts.length > 0 && colCounts.length > 0)
    set(0, 0, new TableItem(rowCounts.length, colCounts.length, true, undefined));

  for (var layer = 0; layer < colCounts.length; layer++)
  {
    var contents = [];
    for (var i = 0; i < colCounts[layer]; i++)
      contents[i] = cols[layer].View.replace("{name}", cols[layer].Names[i]);
    for (var i = 0; i < colMult[layer]; i++)
      for (var j = 0; j < colCounts[layer]; j++)
        set(rowCounts.length + (i * colCounts[layer] + j) * colSpans[layer], layer, new TableItem(colSpans[layer], 1, true, contents[j]));
  }

  for (var layer = 0; layer < rowCounts.length; layer++)
  {
    var contents = [];
    for (var i = 0; i < rowCounts[layer]; i++)
      contents[i] = rows[layer].View.replace("{name}", rows[layer].Names[i]);
    for (var i = 0; i < rowMult[layer]; i++)
      for (var j = 0; j < rowCounts[layer]; j++)
        set(layer, colCounts.length + (i * rowCounts[layer] + j) * rowSpans[layer], new TableItem(1, rowSpans[layer], true, contents[j]));
  }

  data.value?.Characters.forEach(entity => {
    var x = rowCounts.length;
    for (var i = 0; i < colCounts.length; i++)
    {
        var index = cols[i].Names.indexOf(entity[cols[i].Property]);
        if (index == -1)
          return;
        x += index * colSpans[i];
    }
    
    var y = colCounts.length;
    for (var i = 0; i < rowCounts.length; i++)
    {
        var index = rows[i].Names.indexOf(entity[rows[i].Property]);
        if (index == -1)
            return;
        y += index * rowSpans[i];
    }
    if (contains(x, y))
        set(x, y, new TableItem(1, 1, false, table.value![y]![x].Content + `<img src=\"images/characters/${entity.Name}.webp\"/>`));
    else
        set(x, y, new TableItem(1, 1, false, `<img src=\"images/characters/${entity.Name}.webp\"/>`));
  });

  for (var x = rowCounts.length; x < rowCounts.length + colSpans[0] * colCounts[0]; x++)
    for (var y = colCounts.length; y < colCounts.length + rowSpans[0] * rowCounts[0]; y++)
      if (!contains(x, y))
        set(x, y, new TableItem(1, 1, false, undefined));

  console.log(table.value);
}
</script>

<template>
  <h3 v-if="error">{{error}}</h3>
  <div v-else id="main">
    <div id="options">
      <div id="legends">
        <div class="legend">
          <p class="legend-title">Colomn legends</p>
          <div v-for="legend in config?.Cols" :key="legend.Id">
            <div class="legend-item">
              <p class="legend-item-title">{{legend.Name}}</p>
              <p class="legend-item-remove" @click="removeLegend(legend, false)">✖</p>
            </div>
          </div>
          <select v-if="availableLegends?.length" size="1">
            <option></option>
            <option v-for="legend in availableLegends" :key="legend.Id" @click="addLegend(legend, false)">{{legend.Name}}</option>
          </select>
        </div>
        <div class="legend">
          <p class="legend-title">Row legends</p>
          <div v-for="legend in config?.Rows" :key="legend.Id">
            <div class="legend-item">
              <p class="legend-item-title">{{legend.Name}}</p>
              <p class="legend-item-remove" @click="removeLegend(legend, true)">✖</p>
            </div>
          </div>
          <select v-if="availableLegends?.length" size="1">
            <option></option>
            <option v-for="legend in availableLegends" :key="legend.Id" @click="addLegend(legend, true)">{{legend.Name}}</option>
          </select>
        </div>
      </div>
    </div>
    <table v-if="table" id="table">
      <tr v-for="layer in table">
        <template v-for="item in layer.filter(i => i)">
          <th v-if="item.IsLegend" class="table-legend" :colspan="item.ColSpan" :rowspan="item.RowSpan" v-html="item.Content"></th>
          <td v-else class="table-item" v-html="item.Content"></td>
        </template>
      </tr>
    </table>
  </div>
</template>

<style scoped>
  #main {
    display: flex;
    flex-wrap: wrap;
  }

  #legends {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
  }

  .legend {
    margin: 5px;
    padding: 5px;
    border: solid 1px gray;
  }

  .legend-title {
    margin: 1px;
    font-weight: bold;
  }

  .legend-item {
    display: flex;
  }

  .legend-item-title {
    margin: 5px;
    padding: 3px;
  }

  .legend-item-remove {
    margin: 5px;
    padding: 3px;
    width: 15px;
    height: 15px;
    text-align: center;
    border: solid 1px gray;
    padding: 3px;
    cursor: pointer;
    user-select: none;
  }

  #table {
    border: solid 4px black;
  }

  .table-legend {
    border: solid 3px black;
  }

  .table-item {
    border: solid 1px black;
  }
</style>

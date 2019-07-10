const fs = require('fs');
const path = require('path');

const vscode = require('vscode');


function getAllCombinations(array) {		
	var combi = [];
	var temp;
	var letLen = Math.pow(2, array.length);

	for (var i = 0; i < letLen; i++){
		temp = [];
		for (var j = 0; j < array.length; j++) {
			if ((i & Math.pow(2,j))){ 
				temp.push(array[j])
			}
		}
		if (temp.length) {
			combi.push(temp);
		}
	}
	return combi;
}

class VennPreview {

	constructor() {
		this.disposables = [];

		this.panel = vscode.window.createWebviewPanel('vennPreview', 'Venn Preview', {
			preserveFocus: true,
			viewColumn: vscode.ViewColumn.Beside
		}, {
			enableScripts: true
		});
		this.disposables.push(this.panel);

		this.setEditor(vscode.window.activeTextEditor.document);
		var disposable = vscode.window.onDidChangeTextEditorSelection((e) => {
			this.setEditor(e.textEditor.document);
			e.textEditor.document.uri			
		});
		this.disposables.push(disposable);

	}

	dispose() {
        this.disposables && this.disposables.length && this.disposables.map(d => d.dispose());
	}
	
	/**
	 * @param {vscode.TextDocument} document
	 */
	setEditor(document) {
		if(document.languageId !== 'venn' || document === this.document) {
			return;
		}

		this.document = document;
		this.panel.title = path.basename(document.fileName);

		this.setFile(document.uri.fsPath);
	}

	setFile(documentPath) {
		this.path = documentPath;
		this.updateView();
		fs.watchFile(this.path, {persistent: false}, (curr, prev) => {
			this.updateView();
		});
	}

	updateView() {
		fs.readFile(this.path, 'utf-8', (err, json) => {
			var config;
			try{
				config = JSON.parse(json);
			} catch(err) {
				vscode.window.showErrorMessage('Venn: invalid JSON: ' + err.message);
				return;
			}

			var hasErrors = false;
			if(config.groups && typeof config.groups !== 'object') {
				vscode.window.showErrorMessage('Venn: groups property must be an object');
				hasErrors = true;
			}
			if(config.charts) {
				if(!Array.isArray(config.charts)) {
					vscode.window.showErrorMessage('Venn: charts property must be an array');
					hasErrors = true;
				}
			}
			else if(!config.items) {
				vscode.window.showErrorMessage('Venn: missing items or charts property');
				hasErrors = true;
			}			
			else if(!Array.isArray(config.items)) {
				vscode.window.showErrorMessage('Venn: items property must be an array');
				hasErrors = true;
			}
			else {
				config.charts = [{
					name: 'deafult',
					items: config.items
				}];
			}

			var charts = config.charts.map(chart => {
				var sets = {};
				for(var i = 0; i < chart.items.length; i++) {
					var item = chart.items[i];
					if(!item.name) {
						vscode.window.showErrorMessage('Venn: item.name property is required');
						hasErrors = true;
						break;
					}
					if(!item.groups || !Array.isArray(item.groups) || !item.groups.length) {
						vscode.window.showErrorMessage('Venn: item.groups must be a valid array with at least one value');
						hasErrors = true;
						break;
					}
					
					var groupsCombinations = getAllCombinations(item.groups);
					for(var j = 0; j < groupsCombinations.length; j++) {
						var groups = groupsCombinations[j];
						groups.sort();
						var group = groups.join('_');

						var groupNames = groups.map(g => config.groups && config.groups[g] && config.groups[g].name || g);
						if(!sets[group]) {
							sets[group] = {
								chart: chart.name,
								name: group,
								sets: groupNames,
								items: [],
								size: 0
							};
						}
						sets[group].items.push(item);
						sets[group].size++;
					}
				};
				return {
					name: chart.name,
					sets: Object.keys(sets).map(g => sets[g])
				};
			});
			
			if(hasErrors) {
				return;
			}

			this.panel.webview.html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
	.venntooltip {
		position: absolute;
		text-align: center;
		width: 128px;
		background: #333;
		color: #ddd;
		padding: 2px;
		border: 0px;
		border-radius: 8px;
		opacity: 0;
	}
</style>
</head>
<body>
<table id="charts">
	<tr>${charts.map(chart => `<td><div id="venn-${chart.name}"></div><div id="list-${chart.name}"></div></td>`).join('')}</tr>
</table>
</body>
<script src="https://d3js.org/d3.v4.min.js"></script>
<script src="https://benfred.github.io/venn.js/venn.js"></script>
<script>
	var setsCharts = ${JSON.stringify(charts)};
	var table = d3.select("#charts")
	setsCharts.forEach(setsChart => {
		var chart = venn.VennDiagram();
		var div = d3.select("#venn-" + setsChart.name)
		div.datum(setsChart.sets).call(chart);

		// add a tooltip
		var tooltip = d3.select("body").append("div")
			.attr("class", "venntooltip");

		// add listeners to all the groups to display tooltip on mouseover
		div.selectAll("g")
		.on("mouseover", function(d, i) {
			// sort all the areas relative to the current item
			venn.sortAreas(div, d);

			// Display a tooltip with the current size
			tooltip.transition().duration(400).style("opacity", .9);
			tooltip.text("[" + d.sets.join(", ") + "]: " + d.size + " items");
			
			// highlight the current path
			var selection = d3.select(this).transition("tooltip").duration(400);
			selection.select("path")
				.style("cursor", "pointer")
				.style("stroke-width", 3)
				.style("fill-opacity", d.sets.length == 1 ? .4 : .1)
				.style("stroke-opacity", 1);
		})

		.on("mousemove", function() {
			tooltip.style("left", (d3.event.pageX + 10) + "px")
				.style("top", (d3.event.pageY - 28) + "px");
		})
		
		.on("mouseout", function(d, i) {
			tooltip.transition().duration(400).style("opacity", 0);
			var selection = d3.select(this).transition("tooltip").duration(400);
			selection.select("path")
				.style("cursor", "auto")
				.style("stroke-width", 0)
				.style("fill-opacity", d.sets.length == 1 ? .25 : .0)
				.style("stroke-opacity", 0);
		})
		
		.on("click", function(d, i) {
			var ds = table.selectAll('g[data-group="' + d.name + '"]');
			ds.each(di => {
				var list = document.getElementById('list-' + di.chart);
				list.innerHTML = "<b>" + di.sets.join(", ") + "</b><br/><ul>" + di.items.map(item => "<li>" + item.name + "</li>").join("") + "</ul>";
			});
		})
		
		// add class
		.each(function(d) {
			this.dataset.chartName = setsChart.name;
			this.dataset.group = d.name;
		});
	});
</script>
</html>`;
			fs.writeFileSync('C:/opt/venn/test.html', this.panel.webview.html);
		});
	}
}

var vennPreview;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.log('Congratulations, your extension "venn" is now active!');

	let disposable = vscode.commands.registerCommand('venn.preview', function () {
		if(!vennPreview) {
			vennPreview = new VennPreview();
		}
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {
	if(vennPreview) {
		vennPreview.dispose();
	}

	vennPreview = null;
}

module.exports = {
	activate,
	deactivate
}

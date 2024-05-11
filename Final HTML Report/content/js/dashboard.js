/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 60.46511627906977, "KoPercent": 39.53488372093023};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Add Employee"], "isController": false}, {"data": [0.0, 500, 1500, "Dashboard-0"], "isController": false}, {"data": [0.0, 500, 1500, "View Employee List"], "isController": false}, {"data": [0.0, 500, 1500, "Dashboard"], "isController": false}, {"data": [0.0, 500, 1500, "View System User-1"], "isController": false}, {"data": [0.0, 500, 1500, "View System User-0"], "isController": false}, {"data": [0.0, 500, 1500, "Dashboard-1"], "isController": false}, {"data": [0.0, 500, 1500, "View System User"], "isController": false}, {"data": [0.0, 500, 1500, "Add Employee-1"], "isController": false}, {"data": [0.0, 500, 1500, "Add Employee-0"], "isController": false}, {"data": [0.0, 500, 1500, "View Buzz"], "isController": false}, {"data": [0.0, 500, 1500, "Candidate Data"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10664, 4216, 39.53488372093023, 56720.09471117801, 0, 199929, 47438.5, 140655.0, 170310.0, 193535.05000000013, 53.29468502461331, 157.80162625877708, 6.54847150728404], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Add Employee", 1000, 480, 48.0, 75294.86800000006, 0, 198084, 100059.0, 176744.8, 190347.8, 195791.81, 5.012958497716598, 19.494132567060852, 0.84219660948552], "isController": false}, {"data": ["Dashboard-0", 866, 0, 0.0, 52148.41570438798, 1952, 105181, 51174.0, 91730.5, 96679.0, 100015.08000000002, 8.161803513533892, 7.4364869903585165, 1.2274587315275578], "isController": false}, {"data": ["View Employee List", 1000, 1000, 100.0, 28.700000000000024, 0, 1188, 32.0, 43.0, 46.0, 50.99000000000001, 219.10604732690624, 562.5291000219106, 0.0], "isController": false}, {"data": ["Dashboard", 1000, 228, 22.8, 114798.03000000006, 1, 199929, 131028.0, 186857.69999999998, 191491.95, 197881.05, 4.997626127589395, 22.314342093755467, 1.2122757315275243], "isController": false}, {"data": ["View System User-1", 852, 86, 10.093896713615024, 80926.4718309859, 1, 127192, 82574.0, 108911.0, 117481.49999999997, 126839.07, 4.316634241245136, 16.638779300041545, 0.564703836206023], "isController": false}, {"data": ["View System User-0", 852, 0, 0.0, 51006.64553990607, 1947, 105326, 48800.5, 91895.0, 95938.69999999998, 104848.13000000002, 7.995570529002712, 7.285026663632354, 1.2493078951566738], "isController": false}, {"data": ["Dashboard-1", 866, 94, 10.854503464203233, 80014.78060046189, 0, 127598, 82063.0, 108258.90000000001, 120166.0, 125512.28, 4.372699409736073, 16.82387498295859, 0.5671988530500336], "isController": false}, {"data": ["View System User", 1000, 234, 23.4, 112822.19800000005, 1, 198534, 131475.5, 183083.8, 192882.8, 197980.99, 5.014517026792564, 22.266228309079786, 1.226470554129204], "isController": false}, {"data": ["Add Employee-1", 614, 94, 15.309446254071661, 73075.03583061894, 0, 127601, 78275.0, 105447.0, 111297.25, 126870.6, 3.1098370121253254, 11.843225389109493, 0.38322948216655356], "isController": false}, {"data": ["Add Employee-0", 614, 0, 0.0, 49109.93159609128, 1945, 106067, 51427.0, 91766.0, 95472.5, 101985.35, 5.763201862246335, 5.251042321753741, 0.8667315300643902], "isController": false}, {"data": ["View Buzz", 1000, 1000, 100.0, 19.787999999999993, 0, 1305, 7.0, 47.0, 50.0, 54.0, 502.76520864756156, 1290.7907554047258, 0.0], "isController": false}, {"data": ["Candidate Data", 1000, 1000, 100.0, 17.59200000000003, 0, 58, 8.0, 47.0, 50.0, 52.99000000000001, 507.0993914807302, 1301.9182619168357, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 4216, 100.0, 39.53488372093023], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10664, 4216, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 4216, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Add Employee", 1000, 480, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 480, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["View Employee List", 1000, 1000, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 1000, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Dashboard", 1000, 228, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 228, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["View System User-1", 852, 86, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 86, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Dashboard-1", 866, 94, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 94, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["View System User", 1000, 234, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 234, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Add Employee-1", 614, 94, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 94, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["View Buzz", 1000, 1000, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 1000, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Candidate Data", 1000, 1000, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 1000, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});

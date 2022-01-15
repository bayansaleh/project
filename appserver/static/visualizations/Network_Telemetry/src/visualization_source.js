define([
            'jquery',
            'underscore',
            'api/SplunkVisualizationBase',
           
            'leaflet',
          
            'src'
        ],  
        function(
            $,
            _,
            SplunkVisualizationBase,
            
            
        ) {
  
    return SplunkVisualizationBase.extend({
 
        initialize: function() {
            // Save this.$el for convenience
            this.$el = $(this.el);
             
            // Add a css selector class
            this.$el.addClass('splunk-radial-meter');
        },
 
        getInitialDataParams: function() {
            return ({
                outputMode: SplunkVisualizationBase.ROW_MAJOR_OUTPUT_MODE,
                count: 10000
            });
        },
  
        updateView: function(data, config) {

          function getRandomData() {
            hideMarkers();
            const json = fetch('./data.json', {
                method: 'POST',
            }).then(response => response.json()).then(result => {
                var chosenIndices = [];

                const values = Object.values(result);

                let pathsNum = parseInt(Math.random() * values.length);
                while (pathsNum < 2) {
                    pathsNum = parseInt(Math.random() * values.length);
                }

                for (let i = 0; i < pathsNum; i++) {
                    let index = parseInt(Math.random() * values.length);
                    while (chosenIndices.some(item => item == index)) {
                        index = parseInt(Math.random() * values.length);
                    }
                    chosenIndices.push(index);
                }

                // This is to get all the combinations of src and dst from chosen indices.
                let combinations = chosenIndices.flatMap(
                    (v, i) => chosenIndices.slice(i + 1).map(w => v + ' ' + w)
                );

                // show at most 4 random paths.
                let dataArray = [];
                if (combinations.length >= 4) {
                    for (let i = 0; i < 4; i++) {
                        dataArray.push(prepareDataArray(values, combinations, i));
                    }
                }
                else {
                    for (let i = 0; i < combinations.length; i++) {
                        dataArray.push(prepareDataArray(values, combinations, i));
                    }
                }

                mostRecentData = dataArray;
                migrationLayer.setData(dataArray);
            })
                .catch(error => {
                    // console.error('Error:', error);
                });
        }
            // Fill in this part in the next steps.
           
        }
    });
});
define([
            'jquery',
            'underscore',
            'api/SplunkVisualizationBase',
           
            'leaflet',
            'leaflet1',
            'src'
        ],  
        function(
            $,
            _,
            SplunkVisualizationBase,
           
            
        ) {
  
    return SplunkVisualizationBase.extend({
 
        initialize: function() {
            // Save this.$el for convenience
            this.$el = $(this.el);
             
            // Add a css selector class
            this.$el.addClass('splunk-radial-meter');
        },
 
        getInitialDataParams: function() {
            return ({
                outputMode: SplunkVisualizationBase.ROW_MAJOR_OUTPUT_MODE,
                count: 10000
            });
        },
  
        updateView: function(data, config) {

          function getRandomData() {
            hideMarkers();
            const json = fetch('./data.json', {
                method: 'POST',
            }).then(response => response.json()).then(result => {
                var chosenIndices = [];

                const values = Object.values(result);

                let pathsNum = parseInt(Math.random() * values.length);
                while (pathsNum < 2) {
                    pathsNum = parseInt(Math.random() * values.length);
                }

                for (let i = 0; i < pathsNum; i++) {
                    let index = parseInt(Math.random() * values.length);
                    while (chosenIndices.some(item => item == index)) {
                        index = parseInt(Math.random() * values.length);
                    }
                    chosenIndices.push(index);
                }

                // This is to get all the combinations of src and dst from chosen indices.
                let combinations = chosenIndices.flatMap(
                    (v, i) => chosenIndices.slice(i + 1).map(w => v + ' ' + w)
                );

                // show at most 4 random paths.
                let dataArray = [];
                if (combinations.length >= 4) {
                    for (let i = 0; i < 4; i++) {
                        dataArray.push(prepareDataArray(values, combinations, i));
                    }
                }
                else {
                    for (let i = 0; i < combinations.length; i++) {
                        dataArray.push(prepareDataArray(values, combinations, i));
                    }
                }

                mostRecentData = dataArray;
                migrationLayer.setData(dataArray);
            })
                .catch(error => {
                    // console.error('Error:', error);
                });
        }
            // Fill in this part in the next steps.
           
        }
    });
});


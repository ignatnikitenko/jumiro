function calcWidgetCosts(tags) {
    var result = {
        amount: 0,
        tags: []
    };
    var amounts = [];
    for (var tagNo in tags) {
        try {
            var curTagTitle = tags[tagNo].title
            var curTagResult = Number(curTagTitle);
            if (!isNaN(curTagResult)) {
                amounts.push(curTagResult);
            } else {
                result.tags.push(curTagTitle);
            }
        } catch (e) {
            // Nothing to to in case of errors
        }
    }
    amounts.sort(function(a, b) {
        return a-b;
    });
    if (amounts.length > 0) {
        result.amount = amounts[0];
    }
    return result;
}

function iterationSelection(settings, processors) {
    var result = {
        totalResult: 0,
        groupedResult: {}
    };

    var selectionPromise = miro.board.selection.get();
    selectionPromise.then(function(foundWidgets) {
        var widgetCount = foundWidgets.length;
        var processResult = result;
        for (var widgetNo = 0; widgetNo < widgetCount; widgetNo++) {
            var currentWidget = foundWidgets[widgetNo];
            var curWidgetProcessor = processors[currentWidget.type];
            debugger;
            if (typeof curWidgetProcessor !== 'undefined') {
                var tags = currentWidget.tags;
                processResult = curWidgetProcessor(currentWidget, tags, processResult);
            }
        }
        return processResult;
    }, function() {
        console.log('Error');
        return result;
    }).then(function(calcResult) {
        console.log('Result ', calcResult)
    });
}

iterationSelection({},
    {
        'STICKER': function(widget, tags, result) {
            var widgetCost = calcWidgetCosts(tags);
            result.totalResult += widgetCost.amount;
            var tagCount = widgetCost.tags.length;
            for (var tagNo in widgetCost.tags) {
                var tagName = widgetCost.tags[tagNo];
                var oldTagAmount = result.groupedResult[tagName];
                if (typeof oldTagAmount === 'undefined') {
                    result.groupedResult[tagName] = (widgetCost.amount / tagCount);
                } else {
                    result.groupedResult[tagName] += (widgetCost.amount / tagCount);
                }
            }
            return result;
        }
    });

iterationSelection({}, {
    'STICKER': function (widget, tags, result) {
        var tagNames = [];
        for (var tagNo = 0; tagNo < tags.length; tagNo++) {
            tagNames.push(tags[tagNo].title);
        }
        console.log('Found widget ', widget.id, widget.type, tagNames);
        return result;
    }
});
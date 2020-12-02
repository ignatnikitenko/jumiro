function calcWidgetCosts(curWidget, tags, settings) {
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
    // Sort amounts (from bigger to smaller)
    amounts.sort(function(a, b) {
        return b-a;
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
    return selectionPromise.then(function(foundWidgets) {
        var widgetCount = foundWidgets.length;
        var processResult = result;
        for (var widgetNo = 0; widgetNo < widgetCount; widgetNo++) {
            var currentWidget = foundWidgets[widgetNo];
            var curWidgetProcessor = processors[currentWidget.type];
            if (typeof curWidgetProcessor !== 'undefined') {
                var tags = currentWidget.tags;
                processResult = curWidgetProcessor(currentWidget, tags, processResult, settings);
            }
        }
        return processResult;
    }, function() {
        console.log('Error');
        return result;
    });
}

function stickerProcessor(widget, tags, result, settings) {
    var widgetCost = calcWidgetCosts(widget, tags, settings);
    result.totalResult += widgetCost.amount;
    var tagCount = widgetCost.tags.length;
    for (var tagNo in widgetCost.tags) {
        var tagName = widgetCost.tags[tagNo];
        var tagAmount = result.groupedResult[tagName];
        if (typeof tagAmount === 'undefined') {
            tagAmount = (widgetCost.amount / tagCount);
        } else {
            tagAmount += (widgetCost.amount / tagCount);
        }
        result.groupedResult[tagName] = tagAmount
    }
    return result;
}

function cardProcessor(widget, tags, result, settings) {
    // Now calculation is the same for cards and stickers
    return stickerProcessor(widget, tags, result, settings);
}
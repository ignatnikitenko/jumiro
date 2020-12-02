function defValue(rawValue, defaultValue) {
    return typeof rawValue === 'undefined' ? defaultValue : rawValue;
}

function getWidgetText(rawText) {
    var d = document.createElement('div');
    d.innerHTML = rawText;
    return d.innerText;
}

function calcWidgetCosts(widget, tags, settings) {
    var result = {
        amount: 0,
        tags: []
    };
    var amounts = [];
    // Getting amount from widget text
    if (defValue(settings.calculatedFromText, false)) {
        var widgetText = getWidgetText(defValue(widget.text, widget.title));
        var widgetAmount = Number(widgetText);
        if (!isNaN(widgetAmount)) {
            amounts.push(widgetAmount);
        }
    }
    var hasNoWhiteList = defValue(settings.whiteList, null) === null;
    for (var tagNo in tags) {
        try {
            var curTagTitle = tags[tagNo].title
            var curTagResult = Number(curTagTitle);
            if (!isNaN(curTagResult) && !defValue(settings.calculatedFromText, false)) {
                amounts.push(curTagResult);
            } else {
                if (hasNoWhiteList) {
                    result.tags.push(curTagTitle);
                } else {
                    for (var word in settings.whiteList) {
                        if (settings.whiteList[word].toLowerCase() === curTagTitle.toLowerCase()) {
                            result.tags.push(curTagTitle);
                            break;
                        }
                    }
                }
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
        var tagAmount = defValue(result.groupedResult[tagName], 0);
        if (defValue(settings.distributedAmounts, false)) {
            tagAmount += (widgetCost.amount / tagCount);
        } else {
            tagAmount += (widgetCost.amount);
        }
        result.groupedResult[tagName] = tagAmount
    }
    return result;
}

function cardProcessor(widget, tags, result, settings) {
    // Now calculation is the same for cards and stickers
    return stickerProcessor(widget, tags, result, settings);
}
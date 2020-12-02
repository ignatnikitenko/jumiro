function defValue(rawValue, defaultValue) {
    return typeof rawValue === 'undefined' ? defaultValue : rawValue;
}

function getWidgetText(rawText) {
    var d = document.createElement('div');
    d.innerHTML = rawText;
    return d.innerText;
}

function getNumbersFromWidgetText(widget, tags, settings) {
    var widgetText = getWidgetText(defValue(widget.text, widget.title));
    return {
        amounts: [Number(widgetText)],
        tagUsed: []
    };
}

function getNumbersFromTags(widget, tags, settings) {
    var amounts = [], tagUsed = [];
    for (var tagNo in tags) {
        var curTagTitle = tags[tagNo].title
        var curTagResult = Number(curTagTitle);
        if (!isNaN(curTagResult)) {
            amounts.push(curTagResult);
            tagUsed.push(tagNo);
        }
    }
    return {
        amounts: amounts,
        tagUsed: tagUsed
    };
}

function getNumbersFromTagsWithRegExp(widget, tags, settings) {
    var regExp = settings.regExp;
    var pattern = new RegExp(regExp);
    var amounts = [], tagUsed = [];
    for (var tagNo in tags) {
        var curTagTitle = tags[tagNo].title
        var matchResult = pattern.exec(curTagTitle);
        if (defValue(matchResult, null) !== null) {
            var curTagResult = Number(matchResult[matchResult.length - 1]);
            if (!isNaN(curTagResult)) {
                amounts.push(curTagResult);
                tagUsed.push(tagNo);
            }
        }
    }
    return {
        amounts: amounts,
        tagUsed: tagUsed
    };
}

function calcWidgetCosts(widget, tags, settings, numbersParser) {
    var result = {
        amount: 0,
        tags: []
    };
    var numberParserResult = numbersParser(widget, tags, settings);
    var hasNoWhiteList = defValue(settings.whiteList, null) === null;
    for (var tagNo in tags) {
        if (numberParserResult.tagUsed.indexOf(tagNo) === -1) {
            var curTagTitle = tags[tagNo].title
            var curTagResult = Number(curTagTitle);
            if (isNaN(curTagResult)) {
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
        }
    }
    // Sort amounts (from bigger to smaller)
    numberParserResult.amounts.sort(function (a, b) {
        return b - a;
    });
    if (numberParserResult.amounts.length > 0) {
        result.amount = numberParserResult.amounts[0];
    }
    return result;
}

function iterationSelection(settings, processors) {
    var result = {
        totalResult: 0,
        groupedResult: {}
    };

    var selectionPromise = miro.board.selection.get();
    return selectionPromise.then(function (foundWidgets) {
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
    }, function () {
        console.log('Error');
        return result;
    });
}

function getNumbersParser(settings) {
    if (defValue(settings.calculatedFromText, false)) {
        return getNumbersFromWidgetText;
    } else if (defValue(settings.regExp, null) !== null) {
        return getNumbersFromTagsWithRegExp;
    } else {
        return getNumbersFromTags;
    }
}

function groupValueProcessor(result, amount, settings, tagName, tagCount) {
    var tagAmount = defValue(result.groupedResult[tagName], 0);
    if (defValue(settings.distributedAmounts, false)) {
        tagAmount += (amount / tagCount);
    } else {
        tagAmount += (amount);
    }
    result.groupedResult[tagName] = tagAmount;
    return result;
}

function stickerProcessor(widget, tags, result, settings) {
    var widgetCost = calcWidgetCosts(widget, tags, settings, getNumbersParser(settings));
    result.totalResult += widgetCost.amount;
    var tagCount = widgetCost.tags.length;
    if (tagCount > 0) {
        for (var tagNo in widgetCost.tags) {
            var tagName = widgetCost.tags[tagNo];
            result = groupValueProcessor(result, widgetCost.amount, settings, tagName, tagCount);
        }
    } else {
        result = groupValueProcessor(result, widgetCost.amount, settings, 'No group', 1);
    }
    return result;
}

function cardProcessor(widget, tags, result, settings) {
    // Now calculation is the same for cards and stickers
    return stickerProcessor(widget, tags, result, settings);
}

async function createImageWidget(settings, imageName) {
    let imageUrl = settings.serverUrl + settings.imagesPath + imageName + settings.tokenParam + settings.token;
    return miro.board.widgets.create({
        type: 'image',
        url: imageUrl,
        scale: 1.0,
        x: 0,
        y: 0
    })
}
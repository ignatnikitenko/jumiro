iterationSelection({}, {
    'STICKER': function (widget, tags, result) {
        var tagNames = [];
        for (var tagNo = 0; tagNo < tags.length; tagNo++) {
            tagNames.push(tags[tagNo].title);
        }
        console.log('Found widget ', widget.id, widget.type, tagNames);
        return result;
    }
}).then(function(calcResult) {
    console.log(calcResult);
});
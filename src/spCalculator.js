// Get numbers from tags
iterationSelection({
    },
    {
        'STICKER': stickerProcessor,
        'CARD': cardProcessor
    }).then(function(calcResult) {
    console.log('Result: ', calcResult)
});

// Get numbers from widget text
iterationSelection({
        calculatedFromText: true
    },
    {
        'STICKER': stickerProcessor,
        'CARD': cardProcessor
    }).then(function(calcResult) {
    console.log('Result: ', calcResult)
});

// Get numbers from tags with tags white list
iterationSelection({
        whiteList: ['Java', 'JavaScript']
    },
    {
        'STICKER': stickerProcessor,
        'CARD': cardProcessor
    }).then(function(calcResult) {
    console.log('Result: ', calcResult)
});

// Get numbers from tags with regexp
iterationSelection({
        regExp: '(\\d*)sp'
    },
    {
        'STICKER': stickerProcessor,
        'CARD': cardProcessor
    }).then(function(calcResult) {
    console.log('Result: ', calcResult)
});
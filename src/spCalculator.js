iterationSelection({
    calculatedFromTitle: true
    },
    {
        'STICKER': stickerProcessor,
        'CARD': cardProcessor
    }).then(function(calcResult) {
    console.log('Result: ', calcResult)
});
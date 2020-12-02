iterationSelection({
        calculatedFromText: true,
        whiteList: ['Java', 'JavaScript']
    },
    {
        'STICKER': stickerProcessor,
        'CARD': cardProcessor
    }).then(function(calcResult) {
    console.log('Result: ', calcResult)
});
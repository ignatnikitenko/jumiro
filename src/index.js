miro.onReady(() => {
    const icon24 = '<circle cx="12" cy="12" r="9" fill="none" fill-rule="evenodd" stroke="currentColor" stroke-width="2"></circle>';

    miro.initialize({
        extensionPoints: {
            bottomBar: {
                title: 'Calc with Jupiter',
                svgIcon: icon24,
                onClick: () => {
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
                },
            },
        },
    })
})
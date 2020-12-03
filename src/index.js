miro.onReady(() => {
    const icon24 = '<circle cx="12" cy="12" r="9" fill="none" fill-rule="evenodd" stroke="currentColor" stroke-width="2"></circle>';

    miro.initialize({
        extensionPoints: {
            bottomBar: {
                title: 'Calc with Jupiter',
                svgIcon: icon24,
                onClick: () => {
                    let settings = {
                        serverUrl: "https://14fdc9b7b82d.ngrok.io/",
                        tokenParam: "?token=",
                        token: "72fd9a01c6513d2a248818648633997d967c4a2f2fd30591",
                        imagesPath: "files/"
                    };

                    createNotebook(settings).then(function(calcResult) {
                            console.log('createNotebook: ', calcResult)
                        });
                }
            }
        }
    })
})
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
                        token: "246f547492cac1f9f8f5cca9c8f76d88acf334cdda674859",
                        imagesPath: "files/"
                    };

                    createNotebook(settings, "hack2", ["print(1+1)", "print(2+2)", "print(3+3)"])
                        .then(function(calcResult) {
                            console.log('createNotebook: ', calcResult)
                        });

                    /*
                    createImageWidget(settings, "hackaton1.jpg").then(function(calcResult) {
                        console.log('createImageWidget: ', calcResult)
                    });
                     */
                },
            },
        },
    })
})
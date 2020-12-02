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
                        token: "4c08c5e6c064eecb775e0459934fd76784a53736a3e84968",
                        imagesPath: "files/"
                    };

                    createNotebook(settings, "hack2").then(function(calcResult) {
                        console.log('createNotebook: ', calcResult)
                    });

                    createImageWidget(settings, "hackaton1.jpg").then(function(calcResult) {
                        console.log('createImageWidget: ', calcResult)
                    });
                },
            },
        },
    })
})
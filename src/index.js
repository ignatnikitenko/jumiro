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
                        token: "b06167b16cb1bcbce923f517730f78242c5ca3d191de3ec5",
                        imagesPath: "files/"
                    };

                    createNotebook(settings, "hackaton2").then(function(calcResult) {
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
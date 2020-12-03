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

async function createStickerWidget(text) {
    return miro.board.widgets.create({
        type: 'sticker',
        text: text
    })
}

async function createNotebook(settings) {
    let cellSources = await getCellSources();
    let cellCount = cellSources.length;
    for (var i = 0 ; i < cellCount; i++) {
        var cellSource = cellSources[i];
        console.log("Calculate:" + cellSource);
        await executeCode(cellSource, createStickerWidget);
        await new Promise(r => setTimeout(r, 200));
    }
    /*
        let name = "hackaton";
        let notebookJson = formNotebookJson(settings, name, cellSources);
        let url = settings.serverUrl + "api/contents/" + name + ".ipynb" + settings.tokenParam + settings.token
        return fetch(url, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(notebookJson)
            })
    })
    */
}

async function getCellSources() {
    return miro.board.widgets.get()
        .then(widgets => widgets
            .filter(widget => widget.type === "TEXT" && widget.text.includes("#IN["))
            .map(widget => widget.text)
            .sort()
            .map(code => prepareSource(code))
        );
}

function prepareSource(source) {
    return source.replace(/&#(\d+);/g, function(match, dec) { return String.fromCharCode(dec);})
        .replace(/#IN\[(\d+)]:/g, "")
        .replaceAll("</p><p>","")
        .replaceAll("<br />", "")
        .replace("<p>","")
        .replace("</p>", "");
}

function formNotebookJson(settings, name, cellSources) {
    cellSources = cellSources.map(cellSource => formCell(cellSource));
    let date = new Date().toJSON();
    return {
        "name": name + ".ipynb",
        "path": name + ".ipynb",
        "last_modified": date,
        "created": date,
        "content": {
            "cells": cellSources,
            "metadata": {},
            "nbformat": 4,
            "nbformat_minor": 4
        },
        "format": "json",
        "mimetype": null,
        "size": 72,
        "writable": true,
        "type": "notebook"
    }
}

function formCell(cellSource) {
    return {
        "cell_type": "code",
        "execution_count": null,
        "metadata": {
            "trusted": true
        },
        "outputs": [],
        "source": cellSource
    }
}

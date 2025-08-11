import {messageService} from '../../services/messageService';
import helpers from '../../utils/helpers';

export const fileUpload = async(e, dataName, imageField, resolve, croppedImage, imageName) => {
    let file = null;
	let recordType = null;

	if (e) {
		file = e.target.files[0];
		recordType = e.target.recordType;
	} else {
		file = await fetch(croppedImage).then(response => response.blob());
	}

    if (!file.type) {
        return;
    }

    if (file.size / 1024 / 1024 >= 5) { // max 5 megabytes
        messageService.success('Файл занадто великий (максимум 5Мб)');
        return;
    }

    const isCorrectFileType = (file.type.indexOf('image') !== -1);

    if (isCorrectFileType) {
        messageService.success('Відвантаження файлу');

        const req = new XMLHttpRequest();
        const formData = new FormData();
        const sanitazedFileName = Date.now() + helpers.sanitazeFileName(file.name || imageName);

        formData.append("fileToUpload", file, sanitazedFileName);

        if (recordType) {
            formData.append("recordType", recordType);
        }

        req.open('POST', '/panel-api/file');

        req.send(formData);
        req.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                const response = JSON.parse(this.response);

                resolve(dataName, imageField, response);
            } else {
                messageService.error('Сталася помилка');
            }
        };
    } else {
        messageService.success('Неправильний тип файлу');
    }
};

$(document).ready(function(){

    $('.upload-btn').on('click', function(){
        $('#upload-input').click();

        $('.progress-bar').text('0%');
        $('.progress-bar').width('0%');
    });

    $('#upload-input').on('change', function(){
        var uploadInput = $('#upload-input');

        if(uploadInput.val() != ''){
            var formData = new FormData();

            formData.append('upload', uploadInput[0].files[0]);

            // Sends the uploaded file to the server
            $.ajax({
                url: '/upload',
                type: 'POST',
                data: formData, 
                processData: false,
                contentType: false,
                success: function(data){
                    uploadInput.val('');
                },
                // Create communication between the client and the server
                // COMPUTE AND DISPLAY THE PROGRESS OF THE MODAL
                xhr: function(){
                    var xhr = new XMLHttpRequest();

                    xhr.upload.addEventListener('progress', function(e){
                        // To determine if the upload size is low
                        if(e.lengthComputable){
                            var uploadPercent = e.loaded / e.total;
                            uploadPercent = (uploadPercent * 100);  // to get the percentage of the upload
                            // to let the progress bar shows the percentage(value of the progress bar)
                            $('.progress-bar').text(uploadPercent+'%');
                            $('.progress-bar').width(uploadPercent+'%');
                            // if the percentage = 100 then the upload is completed
                            if(uploadPercent === 100){
                                $('.progress-bar').text('Done');
                                $('#completed').text('File Uploaded');
                            }
                        }
                    }, false);

                    return xhr;
                }
            })
        }
    })
})
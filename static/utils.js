function showStatus(msg,delay){
  if(delay){
    $('.status').hide().html(msg).fadeIn(200).delay(delay).fadeOut(300);
  }else{
    $('.status').show().html(msg);
  }
}
function ajax(config){
  this.method = config.method || 'GET';
  this.payload = config.payload || null;
  var xhr = new XMLHttpRequest();
  xhr.open(this.method, config.url, true);
  xhr.upload.addEventListener("progress", function(e){
    config.progress(e);
  });
  xhr.addEventListener("load", function(){
    config.success(xhr);
  });
  xhr.addEventListener("error", config.error);
  xhr.send(this.payload);
}

var host = "";
$(document).on('click','#doUpload',function(){
  uploadNow();
});
$(function(){
  $(document).on('change', '.uploadFile', function(e){
    showStatus('Ready to Upload !', 600);
  });
})
function uploadNow(){
  $('.progress').fadeIn(100);
  var uploadURL = host +"uploadFile";
  var uploadFile = $('.uploadFile');
  if(uploadFile.val()!=''){
    var form = new FormData();
    form.append("upload",uploadFile[0].files[0]);
    //Perform the AJAX POST request and send the file
    ajax({
      method:'post',
      url:uploadURL,
      success:function(data){
        $('.progress').fadeOut(100);
        uploadFile.val('');
        showStatus('File uploaded successfully');
      },
      progress:function(event){
        if(event.lengthComputable){
          var perc = (event.loaded *100)/event.total;
          $('.progress').css('width',(perc+'%'));
        }
      },
      error:function(){
        $('.progress').css('width','0%');
        uploadFile.val('');
        showStatus('Some error occured!! Please try again')
      },
      payload:form
    })
  }
}

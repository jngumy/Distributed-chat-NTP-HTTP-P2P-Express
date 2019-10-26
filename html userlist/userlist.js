const PORT = 4000;
const HOST = '127.0.0.1';

function getLista(){
  let xhr = new XMLHttpRequest();
  xhr.withCredentials = false;
  xhr.open('GET', 'http://127.0.0.1:4000/userlist', true);
  xhr.send();

  xhr.onreadystatechange = function (aEvt) {
        if (xhr.readyState == 4) {
          if(xhr.status == 200) {
            var lista = JSON.parse(xhr.responseText);
            document.getElementById("lista").innerHTML="";
            lista.forEach(element => {
              var para = document.createElement("LI");                      
              var t = document.createTextNode('Username: ' + element.username + '    Ip: '+ element.ip+ '    Port:' + element.port + '    Hora Registro: '+ muestraFecha(element.timestamp));      // Create a text node
              para.appendChild(t);                                          
              document.getElementById("lista").appendChild(para);           
            });
            
            
          }    
          else
          alert("Error loading page\n");
      }
  };
  xhr.onerror = function() {
  alert("Request failed");
  };
}

function muestraFecha(date){
  var d = new Date(date);
  return ("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" +
  d.getFullYear() + " a las " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2)+ ":" + ("0" + d.getSeconds()).slice(-2);
}
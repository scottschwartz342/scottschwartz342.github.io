/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */

var inUse = false;
function dropAction(n) {
     if(inUse==false)
     {
          var result = "dd" + n;
          document.getElementById(result).classList.toggle("show");
          inUse=true;
     }
     else if(inUse==true)
     {
          var dropdowns = document.getElementsByClassName("dropdown-content");
          var i;
          for (i = 0; i < dropdowns.length; i++) {
          var openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
               openDropdown.classList.remove('show');
          }
          }
          inUse=false;
     }
}
     
// // Close the dropdown if the user clicks outside of it
// window.onclick = function(event) {
//      if (!event.target.matches('.dropbtn')) {
//           var dropdowns = document.getElementsByClassName("dropdown-content");
//           var i;
//           for (i = 0; i < dropdowns.length; i++) {
//           var openDropdown = dropdowns[i];
//           if (openDropdown.classList.contains('show')) {
//                openDropdown.classList.remove('show');
//           }
//           }
//           inUse=false;
//      }
// }
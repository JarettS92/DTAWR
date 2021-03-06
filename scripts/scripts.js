// // Function to sort tables by the header. If you click a table header,
// // it will sort the table by those values. Excluded "Details" header 
// // as nothing would change
// $('th').click(function(){
//     // Check to see if the header is a "Details" header
//     if($(this).text() != "Details"){
        
//         // If it is not, call the sortTable() function
//         // This will sort the table by whatever header was clicked
//         sortTable($(this).parent().parent().parent().attr('id'), $(this).index());

//         if(!$(this).hasClass("ascending") && !$(this).hasClass("descending")){
//             $(this).parent().children().removeClass("ascending descending");
//             $(this).toggleClass("ascending");
//         } else {
//             $(this).toggleClass("ascending");
//             $(this).toggleClass("descending");
//         }
//     }
// });

// // Sorts tables on the Home Page (Summary page)
// function sortTable(tableID, column){
//     var tbody, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
//     switching = true;
//     // Set the sorting direction to ascending:
//     dir = "asc";
//     /* Make a loop that will continue until
//     no switching has been done: */
//     while (switching) {
//     // Start by saying: no switching is done:
//     switching = false;
//     tbody = $(`#${tableID} tbody`);
//     /* Loop through all table tbody (except the
//     first, which contains table headers): */
//     for (i = 0; i < (tbody.length - 1); i++) {
//         // Start by saying there should be no switching:
//         shouldSwitch = false;
//         /* Get the two elements you want to compare,
//         one from current row and one from the next: */
//         x = tbody[i].firstElementChild.getElementsByTagName("TD")[column];
//         y = tbody[i + 1].firstElementChild.getElementsByTagName("TD")[column];
//         /* Check if the two tbody should switch place,
//         based on the direction, asc or desc: */
//         if (dir == "asc") {
//             if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
//                 // If so, mark as a switch and break the loop:
//                 shouldSwitch = true;
//                 break;
//             }
//         } else if (dir == "desc") {
//             if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
//                 // If so, mark as a switch and break the loop:
//                 shouldSwitch = true;
//                 break;
//             }
//         }
//     }
//     if (shouldSwitch) {
//         /* If a switch has been marked, make the switch
//         and mark that a switch has been done: */
//         tbody[i].parentNode.insertBefore(tbody[i + 1], tbody[i]);
//         switching = true;
//         // Each time a switch is done, increase this count by 1:
//         switchcount ++;
//     } else {
//         /* If no switching has been done AND the direction is "asc",
//         set the direction to "desc" and run the while loop again. */
//         if (switchcount == 0 && dir == "asc") {
//             dir = "desc";
//             switching = true;
//             }
//         }
//     }
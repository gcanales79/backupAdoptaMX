// Program variables
var map;
var marker = [];
var infowindow;
var currentLat;
var currentLng;

//Start Firebase database
var config = {
    apiKey: "AIzaSyBPy8Hgn4T3llG8H-2O2tOGtyRV3GRWpPg",
    authDomain: "pruebaadoptamx.firebaseapp.com",
    databaseURL: "https://pruebaadoptamx.firebaseio.com",
    projectId: "pruebaadoptamx",
    storageBucket: "pruebaadoptamx.appspot.com",
    messagingSenderId: "234653857834"
};

firebase.initializeApp(config);

var dataRef = firebase.database();



function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
}

function showPosition(position) {
    currentLat = position.coords.latitude;
    currentLng = position.coords.longitude;

    initMap();

}

getLocation();

console.log(currentLat);


function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center: new google.maps.LatLng(currentLat, currentLng),
        mapTypeId: 'roadmap'
    });

    // Create the search box and link it to the UI element.
    var input = document.getElementById('address');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function () {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        markers.forEach(function (marker) {
            marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });

    //To add locations to the map from the databse in Firebase
    dataRef.ref("/AddChild").on("child_added", function (childSnapshot) {
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(childSnapshot.val().Lat, childSnapshot.val().Lng),
            map: map,
            animation: google.maps.Animation.DROP,
            title: "Tu nuevo amigo"

        });

        // Gather the variable from the firebase databse
        var petName = childSnapshot.val().name;
        var petRaza = childSnapshot.val().raza;
        var petAge = childSnapshot.val().age;
        var petImage = childSnapshot.val().imageurl;

        // Send the info the infowindow

        addInfowindow(petName, petRaza, petAge, petImage);


    })

    //para obtener la direccion
    var options = {
        componentRestrictions: { country: 'mx' }
    };
    var entrada = document.getElementById("direccion");
    var automatico = new google.maps.places.Autocomplete(entrada, options);


}

function addInfowindow(petName, petRaza, petAge, petImage) {
    //To add the window
    var containerDiv = $("<div>") // Main Div
    containerDiv.attr("id", "iw-container");
    var infoDiv = $("<div>"); //Body Div
    var titleDiv = $("<div>");

    titleDiv.text(petName);

    


    containerDiv.append(titleDiv);
    containerDiv.append(infoDiv);

    titleDiv.attr("class", "row iw-title center-align");
    infoDiv.attr("class", "row valign-wrapper center-align"); //Add a Row to the picture and content
    infoDiv.attr("id", "infoStyle"); // Give style to the infowindow
    var imageDiv = $("<div>"); //Div for appending the image
    imageDiv.attr("class", "col s3"); //Width of 4 col to the imageDiv
    var imagesource = $("<img>")
    imagesource.attr("src", petImage);
    imagesource.attr("class", "imagesize");
    contentDiv = $("<div>"); //Content Div to go inside infoDiv
    contentDiv.attr("class", "col s6");
    var firstRowcontent = $("<div>");
    var secondRowcontent = $("<div>");
    var thirdRowcontent = $("<div>");
    firstRowcontent.text("Mis datos son: ")
    secondRowcontent.text("Edad: " + petAge);
    thirdRowcontent.text("Raza: " + petRaza)
    contentDiv.append(firstRowcontent);
    contentDiv.append(secondRowcontent);
    contentDiv.append(thirdRowcontent);
    var spaceDiv = $("<div>");
    spaceDiv.attr("class", "col s3")
    imageDiv.append(imagesource);
    infoDiv.append(imageDiv);
    infoDiv.append(spaceDiv);
    infoDiv.append(contentDiv);

    var contentString = containerDiv.prop("outerHTML");
    infowindow = new google.maps.InfoWindow()

    google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent(contentString);
        infowindow.open(map, this);
    });
}




// Codigo para probar jalar los datos de firebase
// Initialize Firebase


//Pet Data inital variables
var name = "";
var age = "";
var raza = "";
var image = "";
var Lat;
var Lng;

$("#botonSubmit").on("click", function (event) {
    event.preventDefault();

    name = $("#name").val().trim();
    raza = $("#raza").val().trim();
    age = $("#age").val().trim();

    dataRef.ref("/AddChild").push({

        name: name,
        raza: raza,
        age: age

    });


})

var fileUpload = document.getElementById("cameraInput")

fileUpload.addEventListener('change', function (evt) {
    var firstFile = evt.target.files[0] // upload the first file only
    var storageRef = firebase.storage().ref('photos/myPictureName' + firstFile.name)
    var uploadTask = storageRef.put(firstFile)
    uploadTask.on("state_changed", function (snapshot) {
        var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        name = $("#name").val().trim();
        raza = $("#raza").val().trim();
        age = $("#age").val().trim();
        direccion = $("#direccion").val().trim();

        var geocoder = new google.maps.Geocoder();

        geocoder.geocode({ 'address': direccion }, function (results, status) {

            if (status == google.maps.GeocoderStatus.OK) {
                Lat = results[0].geometry.location.lat();
                Lng = results[0].geometry.location.lng();
                console.log(Lat);
                console.log(Lng);
            }
        });
        console.log(percentage)
        if (percentage == 100) {
            console.log("ya estoy al 100")
            storageRef.getDownloadURL().then(function (url) {
                console.log(url)


                dataRef.ref("/AddChild").push({
                    name: name,
                    raza: raza,
                    age: age,
                    imageurl: url,
                    direccion: direccion,
                    Lat: Lat,
                    Lng: Lng,
                })
            })

        }
    })

});

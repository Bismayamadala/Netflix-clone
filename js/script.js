// const { query } = require("express");

const apikey = '1ae47af48b451fc9b10c35cc9a580bcf';
const apiEndPoint = 'https://api.themoviedb.org/3';
const imgPath = 'https://image.tmdb.org/t/p/original';
const apiPaths = {
    fetchAllCategories: `${apiEndPoint}/genre/movie/list?api_key=${apikey}`,
    fetchMoviesList: (id) => `${apiEndPoint}/discover/movie?api_key=${apikey}&with_genres=${id}`,
    fetchTrending:`${apiEndPoint}/trending/all/day?api_key=${apikey}&language=en-US`,
    searchOnYoutube:(query)=>`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=AIzaSyC2sg46H4zTLrDKex_x_qKI62oGypgHUXc`,
    searchMovies: (query) => `${apiEndPoint}/search/movie?api_key=${apikey}&query=${query}`,

}
function init() {
    fetchTrendingMovies();
    fetchAndBuildAllSections();
}
function fetchTrendingMovies(){
    fetchAndBuildMovieSection(apiPaths.fetchTrending,'Trending Now')
    .then(list =>{
        const randomIndex=parseInt(Math.random()*list.length);
buildBannerSection(list[randomIndex])
    }).catch(err =>{
        console.error(err);
    })
}
function buildBannerSection(movie){
const bannerCont=document.getElementById('banner-section');
bannerCont.style.backgroundImage=`url('${imgPath}${movie.backdrop_path}')`
const div = document.createElement('div');
div.innerHTML=`
<h2 class="banner-title">${movie.title && movie.title.length>20 ? movie.title.slice(0,20).trim()+'...':movie.title}</h2>
<p class="banner-info">${movie.media_type} | ${movie.original_language}</p>
<p class="banner-overview"> ${movie.overview && movie.overview.length>200 ? movie.overview.slice(0,200).trim()+'...':movie.overview}</p>
<div class="action-buttons-cont">
   <button class="action-button"><i class="fa fa-play icon" aria-hidden="true"></i>Play</button>
   <button class="action-button"><i class="fa fa-info-circle icon" aria-hidden="true"></i>More Info</button>
</div>

`;
div.className="banner-content container"
bannerCont.append(div)

}
function fetchAndBuildAllSections() {
    fetch(apiPaths.fetchAllCategories)
        .then(res => res.json())
        .then(res => {
            const categories = res.genres;
            if (Array.isArray(categories) && categories.length) {
                categories.forEach(category => {
                    fetchAndBuildMovieSection(
                        apiPaths.fetchMoviesList(category.id),
                        category.name);
                })
            }
        })
        .catch(err => console.error(err))
}
function fetchAndBuildMovieSection(fetchUrl, categoryName) {
    console.log(fetchUrl, categoryName)
  return fetch(fetchUrl)
        .then(res => res.json())
        .then(res => {
            // console.table(res.results);
            const movies = res.results;
            if (Array.isArray(movies) && movies.length) {
                buildMoviesSection(movies, categoryName);
            }
            return movies;
        })
        .catch(err => console.error(err))

}
function buildMoviesSection(list, categoryName) {
    console.log(list, categoryName);
    const moviesCont = document.getElementById("movie-cont")
    const moviesListHTML = list.map(item => {
        return `

        <div class="movies-item" onmouseover="serchMovieTrailer('${item.title}','yt${item.id}')">
        <img  class="movies-img" src="${imgPath}${item.backdrop_path}" alt="${item.title}">
        <iframe width="225px" height="170px" id="yt${item.id}" src=""></iframe>

                </div>
        `;
    }).join('');
    const moviesSectionHTML = `
    <h2 class="movie-section-heading">${categoryName}<span class="explore">Explore All</span><span class="fa fa-chevron-right" aria-hidden="true"></span></h2>
    <div class="movies-row">
    ${moviesListHTML}
    </div>
    `
    // console.log(moviesListHTML)
    const div=document.createElement("div");
    div.className="movies-section"
    div.innerHTML=moviesSectionHTML;
    moviesCont.append(div)
}
function serchMovieTrailer(movieName,iframeId){
    // console.log(elements,iframeId)
if(!movieName) return ;
fetch(apiPaths.searchOnYoutube(movieName))
.then(res => res.json())
.then(res =>{
    const bestResult=res.items[0];
    const youtubeUrl=`https://www.youtube.com/watch?v=${bestResult.id.videoId}`;
    const elements=document.getElementById(iframeId);
    console.log(youtubeUrl)
    elements.src=`https://www.youtube.com/embed/${bestResult.id.videoId}?autoplay=1&mute=1`;
    // const div=document.createElement('div');
})
}
  
window.addEventListener('load', function () {
    init()
    window.addEventListener('scroll',function(){
const header=document.getElementById("header");
if(window.scrollY>5)header.classList.add('header-bg')
else header.classList.remove('header-bg')
    })
}) 
// Get references to the search box and search icon elements
const searchBox = document.getElementById('searchBox');
const searchIcon = document.getElementById('searchIcon');

// Add a click event listener to the search icon
searchIcon.addEventListener('click', () => {
    // Toggle the visibility of the search box
    if (searchBox.style.display === 'block') {
        searchBox.style.display = 'none';
    } else {
        searchBox.style.display = 'block';
    }
});
const resultsDiv = document.getElementById('results');
const bannersec=document.getElementById('banner-section');
async function searchMovies(query) {
    try {
        const response = await fetch(apiPaths.searchMovies(query));

        if (!response.ok) {
            throw new Error(`Network response was not ok (Status: ${response.status})`);
        }

        const data = await response.json();

        if (data.results.length > 0) {
            const movies = data.results;
            resultsDiv.style.display = 'block';
            resultsDiv.style.display = 'flex';
            bannersec.style.display = 'none';

            resultsDiv.innerHTML = ''; // Clear previous results

            movies.forEach((movie) => {
                const movieCard = document.createElement('div');
                movieCard.classList.add('movie-card');
                movieCard.innerHTML = `
                <img src="${imgPath}${movie.poster_path}" alt="${movie.title} Poster">
                    <h3>${movie.title}</h3>
                    <p>${movie.release_date}</p>
                `;
                resultsDiv.appendChild(movieCard);
            });
        } else {
            resultsDiv.innerHTML = 'No results found.';
        }
    } catch (error) {
        console.error('Error:', error);
        resultsDiv.innerHTML = 'An error occurred while fetching the data.';
    }
}

searchBox.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            const query = searchBox.value.trim();
            if (query !== '') {
                searchMovies(query);
            }
        }
    });
    searchIcon.addEventListener('click', () => {
            const query = searchBox.value.trim();
            if (query !== '') {
                searchMovies(query);
            }
        })
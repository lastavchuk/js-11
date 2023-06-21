import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Report } from 'notiflix/build/notiflix-report-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

let page = 1;
let q = '';
const resultsOfPage = 40;

const simpleGallery = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
});

let optionsLoadMore = {
    root: null,
    rootMargin: '500px',
    threshold: 0,
};
let optionsEnd = {
    root: null,
    rootMargin: '0px',
    threshold: 0,
};

const submit = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
let guard = document.querySelector('.js-guard');

let observer = new IntersectionObserver(loarMore, optionsLoadMore);
let observerEnd = new IntersectionObserver(showFinishResult, optionsEnd);

submit.addEventListener('submit', handlerSearch);

async function handlerSearch(e) {
    e.preventDefault();
    page = 1;
    observerEnd.unobserve(guard);

    q = e.currentTarget.searchQuery.value;
    await refreshDOM(q);

    e.target.reset();
    if (page > 1) observer.observe(guard);
}

function loarMore(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            refreshDOM(q);
        }
    });
}

async function refreshDOM(value) {
    try {
        const { hits, totalHits } = await fetchImages(value);

        if (!!totalHits) {
            if (page > 1) {
                gallery.insertAdjacentHTML('beforeend', renderMurkup(hits));
                scroll();
            } else gallery.innerHTML = renderMurkup(hits);

            simpleGallery.refresh();

            showTotalFound(totalHits);
            if (totalHits > resultsOfPage) page++;

            if (page >= Math.ceil(totalHits / resultsOfPage)) {
                observer.unobserve(guard);
                observerEnd.observe(guard);
            }
        } else {
            gallery.innerHTML = '';
            showNotFound();
        }
    } catch (error) {
        console.log(error);
    }
}

function renderMurkup(data) {
    return data.map(el => imgTemplate(el)).join('');
}
function imgTemplate(data) {
    const views = `<svg aria-label="Views" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" /><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" /></svg>`;
    const like = `<svg aria-label="Likes" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-hand-thumbs-up" viewBox="0 0 16 16"><path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/></svg>`;
    const comment = `<svg aria-label="Comments" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-chat-dots" viewBox="0 0 16 16"><path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/><path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9.06 9.06 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.437 10.437 0 0 1-.524 2.318l-.003.011a10.722 10.722 0 0 1-.244.637c-.079.186.074.394.273.362a21.673 21.673 0 0 0 .693-.125zm.8-3.108a1 1 0 0 0-.287-.801C1.618 10.83 1 9.468 1 8c0-3.192 3.004-6 7-6s7 2.808 7 6c0 3.193-3.004 6-7 6a8.06 8.06 0 0 1-2.088-.272 1 1 0 0 0-.711.074c-.387.196-1.24.57-2.634.893a10.97 10.97 0 0 0 .398-2z"/></svg>`;
    const download = `<svg aria-label="Downloads" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-cloud-arrow-down" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M7.646 10.854a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 9.293V5.5a.5.5 0 0 0-1 0v3.793L6.354 8.146a.5.5 0 1 0-.708.708l2 2z"/><path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383zm.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/></svg>`;

    return `<a class="photo-card" href="${data.largeImageURL}">
  <img src="${data.webformatURL}" alt="${data.tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">${like}: ${data.likes}</p>
    <p class="info-item">${views}: ${data.views}</p>
    <p class="info-item">${comment}: ${data.comments}</p>
    <p class="info-item">${download}: ${data.downloads}</p>
  </div>
</a>`;
}

async function fetchImages(value) {
    const BASE_URL = 'https://pixabay.com/api/';
    const API_KEY = '11240134-58b8f655e9e0f8ae8b6e8e7de';
    const PARAMS = `key=${API_KEY}&q=${value}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${resultsOfPage}&page=${page}`;

    return (await axios.get(`${BASE_URL}?${PARAMS}`)).data;

    // const resp = await fetch(`${BASE_URL}?${PARAMS}`);
    // if (resp.ok) return await resp.json();
    // else throw new Error(resp.status);
}

function scroll() {
    const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
    });
}

function showTotalFound(total) {
    Notify.success(`Hooray! We found ${total} images.`);
}
function showNotFound() {
    Report.warning(
        'Sorry, images not found.',
        'There are no images matching your search query. Please try again.',
        'OK'
    );
}
function showFinishResult(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            Notify.warning("We're sorry, but you've reached the end of search results.");
        }
    });
}

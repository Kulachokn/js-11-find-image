import './sass/main.scss';
import apiService from './js/apiService';
import card from './templates/imageCard.hbs';

import {Notify} from "notiflix";
import SimpleLightbox from "simplelightbox";
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  input: document.querySelector('input[name="searchQuery"]'),
  form: document.querySelector('form[id="search-form"]'),
  gallery: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more')
}

refs.form.addEventListener('submit', handleForm);
refs.loadMore.addEventListener('click', handleLoadMore);

function handleForm(e) {
  e.preventDefault();

  apiService.searchQuery = refs.input.value;
  refs.gallery.innerHTML = '';
  apiService.page = 1;

  if (apiService.searchQuery.length > 0) {
    fetchImages();
  }
}

async function fetchImages() {
  try {
    refs.loadMore.classList.add('is-hidden');
    const {hits: images, totalHits} = await apiService.fetchImages()

    if (totalHits === 0) {
      Notify.failure("Sorry, there are no images matching your search query. Please try again.");
      return;
    }

    if (totalHits > apiService.page * apiService.perPage) {
      refs.loadMore.classList.remove('is-hidden');
    } else {
      refs.loadMore.classList.add('is-hidden');
      Notify.failure("We're sorry, but you've reached the end of search results.");
    }

    if (apiService.page > 1) {
      Notify.info(`Hooray! We found ${totalHits} images.`);
    }

    renderCard(images);
    simple.refresh();

    const {height: cardHeight} = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  } catch (error) {
    Notify.failure(error.message)
  }
}

function handleLoadMore() {
  apiService.page += 1;
  fetchImages();
}

function renderCard(images) {
  const markup = card(images);
  return refs.gallery.insertAdjacentHTML('beforeend', markup);
}

const simple = new SimpleLightbox('.gallery a', {
  scaleImageToRatio: true,
  captionsData: 'alt',
});
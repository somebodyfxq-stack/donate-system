const LIMIT_GIF = 6;
const UserPageVersion = {v1: 'v1', v2: 'v2'};

const TenorGifAnimations = (modalData, state) => {
	const apiKey = state.TENOR_API_KEY;
	let limitGif = LIMIT_GIF;

	let pathnames = window.location.pathname.split('/');
	const url = pathnames[1];
	let search = '';

	if (modalData.mediaListId) {
		search = '?mediaListId=' + modalData.mediaListId;
	}

	// Function to fetch and render Tenor GIFs
	const fetchAndRenderGifs = function () {
		const searchQuery = $('#search-query').val();

		if (searchQuery === '') {
			$('.load-more-gifs-button').empty();

			$.ajax({
				url: '/' + url + '/media' + search,
				method: 'GET',
				success: function (resp) {
					if (resp.success) {
						//clear all items
						$('.animations').empty();
						resp.media?.video?.forEach(s => {
															$('.animations').append(`
								<div class="col-lg-4 col-sm-4 col-6 mb-0 nopad text-center imageMedia"
																			src="${s.url || s.path}"
																			id="${s._id || s.id}"
																	>
																			<div class="position-relative">
																					<label class="image-checkbox">
																					<video width="100%" height="auto" controls>
											<source class="videoMedia" src="${s.url}" />
										</video>
																					<input name="image" value="${s.name}" type="checkbox">
																					<i class="fa fa-check d-none"></i>
																					</label>
																			</div>
																	</div>
															`);
													});
						resp.media?.animations?.forEach(s => {
							$('.animations').append(`
								<div class="col-lg-4 col-sm-4 col-6 mb-0 nopad text-center imageMedia image-input"
									src="${s.url || s.path}"
									id="${s._id || s.id}"
								>
									<div class="position-relative">
										<label class="image-checkbox">
										<img src="${s.url || s.path}" class="w-100 shadow-1-strong " alt="">
										<input name="image" value="${s.name}" type="checkbox">
										<i class="fa fa-check d-none"></i>
										</label>
									</div>
								</div>
							`);
						});

						$('.imageMedia').on('click', state.onImageClick);

					} else {
						state.showNotification(resp.message || 'Щось пішло не так');
					}
				}
			});
		}

		$.ajax({
			url: 'https://tenor.googleapis.com/v2/search?key=' + apiKey + '&q=' + searchQuery + '&limit=' + limitGif,
			method: 'GET',
			dataType: 'json',
			success: function (response) {
				const tenorGifs = response['results'];

				$('.animations').empty(); //clear all items when search click
				$('.load-more-gifs-button').empty();

				// Append the search results
				if (tenorGifs && tenorGifs.length > 0) {
					tenorGifs.forEach(tenorGif => {
						$('.animations').append(`
							<div class="col-lg-4 col-sm-4 col-6 mb-0 nopad text-center imageMedia image-input"
								src="${tenorGif.media_formats.mediumgif.url}"
								id="${tenorGif.id}"
							>
								<div class="position-relative">
									<label class="image-checkbox">
										<img src="${tenorGif.media_formats.mediumgif.url}" class="w-100 shadow-1-strong " alt="">
										<input name="image" value="${tenorGif.content_description}" type="checkbox">
										<i class="fa fa-check d-none"></i>
									</label>
								</div>
							</div>
						`);
					});

					// Attach click event to new images
					$('.imageMedia').on('click', state.onImageClick);

					// Show button Load more
					if (tenorGifs.length < 50) {
						$('.load-more-gifs-button').append(`
							<button
								id="load-more-tenor-gifs"
								class="btn btn-dark mt-4 mb-2"
								style="background-color: ${state.buttonColor}; border-color: ${state.buttonColor}; color: ${state.buttonTextColor}"
							>
								${state.translation.moreGifs}
							</button>
						`);
					}
				} else {
					$('.animations').html('No GIFs found for the search query: ' + searchQuery);
				}
			},
			error: function (error) {
				console.error('Error fetching GIFs: ', error);
			}
		});

	};

	// Initial load
	$('#load-tenor-gif').click(function () {
		limitGif = LIMIT_GIF; //reset the value of limitGif
		fetchAndRenderGifs();
	});

	// Search when press enter key
	$('#search-query').on( "keypress", function(e) {
		if (e.which === 13) {
			limitGif = LIMIT_GIF; //reset the value of limitGif
			fetchAndRenderGifs();
		}
	} );

	// Load more gifs button click event
	$('.load-more-gifs-button').click(function () {
		limitGif += LIMIT_GIF; // Increase the limit
		fetchAndRenderGifs();
	});
};


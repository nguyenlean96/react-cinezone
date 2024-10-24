import dynamic from 'next/dynamic'
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { get_remote_data, } from '@/hooks/useFirebase';
import NavButton from '@/components/nav-button';
// import ChatGPTLoading from '@/components/Layouts/chatGPTLoading';
import { HorizontalList } from '@/components/index-page/horizontal-list';
import useMovieSuggestions from '@/hooks/useMovieSuggestions';

export default function MovieDetails({ width, height, ...props }:
  {
    width: number;
    height: number;
  }
) {
  const router = useRouter();
  const { movie_id } = router.query;

  const [isLoading, setIsLoading] = useState(false);
  const [remoteData, setRemoteData] = useState<any>(null);
  const [movie, setMovie] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [suggesedGenres, setSuggestedGenres] = useState<any[]>([]);
  const [relatedDisp, setRelatedDisp] = useState<boolean>(true);
  const [detailsDisp, setDetailsDisp] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const getData = async () => {
    console.log(`https://yts.mx/api/v2/movie_details.json?movie_id=${movie_id}`);
    const fetchPromises = [
      fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${movie_id}`).then(
        (res) => res.json()
      ),
      fetch(`https://yts.mx/api/v2/movie_suggestions.json?movie_id=${movie_id}`).then(
        (res) => res.json()
      ),
    ];

    const [detailsData, suggestionsData] = await Promise.all(fetchPromises);
    setMovie(detailsData?.data?.movie);
    setSuggestions(suggestionsData);
  };

  useEffect(() => {
    if (movie_id) {
      getData();
    }

    return () => {
      setMovie(null);
      setSuggestions(null);
      setSuggestedGenres([]);
    };
  }, [router.query?.movie_id]);

  useEffect(() => {
    if (movie && movie?.id !== 0) {
      get_remote_data(movie);
    }

    if (movie && movie?.id === 0) {
      router.back();
    }
  }, [movie, router.query?.movie_id]);

  useEffect(() => {
    if (suggestions) {
      setSuggestedGenres((prev) =>
        suggestions?.data?.movies.reduce((acc: any[], curr: any) => {
          curr.genres.forEach((g: any) => {
            if (!acc.includes(g)) {
              acc.push(g);
            }
          });
          return acc;
        }, [])
      );
    }
  }, [suggestions]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className='relative w-screen overflow-x-hidden h-full min-h-screen bg-gradient-to-b from-gray-900 via-zinc-800 to-slate-800'>
      <NavButton />
      {/* {isLoading && <ChatGPTLoading />} */}
      <div className='absolute top-0 left-0 w-full h-full'>
        <ReactPlayer
          url={`https://www.youtube.com/embed/${movie?.yt_trailer_code}`}
          playing={true}
          muted={true}
          // Make it stretch to the full width and height
          width={width}
          height={height}
        />
      </div>
      {!isPlaying && (
        <div className='relative w-full h-full min-h-screen bg-gradient-to-t lg:bg-gradient-to-r from-zinc-900 via-gray-900/60 to-white/0'>
          <div className='relative h-full min-h-screen w-full'>
            <div className='absolute bottom-12 left-0 lg:left-6 h-full'>
              <div className='flex flex-col justify-end gap-y-5 lg:gap-y-2 lg:min-w-[48vw] w-screen lg:w-[56vw] h-full p-3'>
                <h3 className='text-3xl lg:text-[3.6em] font-bold text-white leading-tight w-full break-words'>
                  {movie && String(movie?.title)}
                </h3>
                <div className='overflow-x-hidden overflow-y-scroll max-h-64 py-2'>
                  <span className='text-white lg:text-lg leading-normal'>
                    {movie && movie?.description_full}
                  </span>
                </div>
                <div className='flex flex-wrap items-center gap-y-4 lg:gap-y-0 gap-x-5 text-xl font-semibold text-gray-500'>
                  <div className='relative px-2 p-0.5'>
                    <div className='opacity-0'>{`IMDb ${movie && String(parseFloat(movie?.rating).toFixed(1))
                      }`}</div>
                    {movie && <a
                      href={`https://www.imdb.com/title/${movie?.imdb_code}`}
                      className='absolute top-0 left-0 hover:bg-[#f3ce13] hover:text-black/80 rounded px-2 transition-all ease-in-out'
                      target='_blank'
                      rel='noreferrer'
                    >{`IMDb ${movie && String(parseFloat(movie?.rating).toFixed(1))}`}</a>}
                  </div>
                  <div className=''>
                    {movie &&
                      `${Math.floor(movie?.runtime / 60)}h ${movie?.runtime % 60}m`}
                  </div>
                  <div className=''>{movie && movie?.year}</div>
                  <div
                    className='flex items-center gap-x-3 max-w-[94vw] overflow-x-scroll'
                    style={{
                      scrollbarWidth: 'none',
                    }}
                  >
                    {movie &&
                      movie?.torrents &&
                      movie?.torrents.length > 0 &&
                      movie?.torrents?.map((t: any, i: number) => (
                        <a
                          key={i}
                          href={t?.url}
                          target='_blank'
                          rel='noreferrer'
                        >
                          <div
                            className={
                              'flex items-center text-[0.8em] leading-none' +
                              (String(t?.type).toLowerCase() === 'web'
                                ? ' uppercase'
                                : '')
                            }
                          >
                            <div className='rounded-l bg-gray-50 overflow-hidden flex justify-center items-center'>
                              {String(t?.type).toLowerCase() === 'bluray' ? (
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  width='20'
                                  height='20'
                                  className='w-8 px-1 h-6'
                                  viewBox='31.31 107.685 322.89 170.28'
                                >
                                  <g fill='#0095d5'>
                                    <path d='M91.59 237.719c-.693 0-3.053.693-5.135 3.746-2.081 3.053-11.518 18.596-13.183 21.51-1.805 2.914-1.249 4.164.693 4.164h4.163c1.943 0 3.747-2.221 4.441-3.748.972-1.387 12.073-19.428 13.877-22.062 1.526-2.639.556-3.607-.694-3.607-1.108-.003-4.162-.003-4.162-.003zM53.705 267.139c7.078-.277 11.796-.557 17.347-10.686 2.358-4.58-4.302-4.721-4.302-4.721-.972 0 6.106.141 9.853-7.771 3.47-7.217-2.637-6.659-3.746-6.799-5.274-.694-15.127-.418-22.62 0-1.527 0-3.331 2.08-4.303 3.33-.693 1.387-12.212 19.981-13.877 22.618-1.805 2.775 0 3.888 1.804 4.025 5.273.281 11.934.281 19.844.004zm6.106-9.715c-1.942 4.025-5.551 4.164-7.632 4.164h-5.551c-.694 0-1.388 0-.694-1.527.972-1.248 2.359-3.469 2.915-4.303.555-.971 1.109-1.248 2.358-1.248h5.968c1.11 0 4.024-.139 2.636 2.914zm5.134-11.934c-1.942 4.021-5.688 4.021-7.632 4.021h-3.33c-.556 0-1.527 0-.556-1.248.972-1.389 2.081-3.748 2.774-4.58s1.249-1.25 2.222-1.25h4.023c1.112.003 4.027.003 2.499 3.057zM284.762 248.82l-9.158 14.57c-1.941 3.053-.275 3.748.693 3.748h4.025c1.525 0 2.637-.14 4.996-3.748l9.158-14.849c2.498-4.024-.557-3.746-2.498-3.746-3.468.139-4.3.002-7.216 4.025zM322.51 249.791h-10.965c-1.109 0-2.637.973-3.469 2.082-.693 1.109-.277 2.221.832 2.221 0-.139 4.439 0 7.771 0 3.469-.139 4.719 2.221.973 7.355-.694 1.107-2.221 2.914-3.471 3.605 0 0-3.054 2.498-12.906 2.498-9.02 0-9.436-.973-9.436-.973-.832-.693-1.109-1.941-.832-2.639.416-.555 1.805-1.107 2.913-1.107h11.38c1.107 0 2.637-.971 3.329-2.221.834-1.109.416-2.496-.692-2.496h-8.465c-4.023 0-3.47-2.641-.416-7.078.832-1.25 2.358-2.775 3.469-3.609 0 0 3.33-2.498 13.045-2.498 3.888 0 10.408-.416 9.992 2.916-.138 1.528-2.359 1.944-3.052 1.944zM351.234 249.93h-8.883c-1.109 0-2.637.973-3.328 2.359l-5.273 8.188c-.695 1.111-.277 2.359.555 2.359h10.547c1.526 0 2.498.139 2.359.555-.139 1.527-2.359 4.164-14.711 4.164-11.102 0-10.408-1.527-10.27-3.189.277-1.807 5.688-10.408 7.354-13.047 1.666-2.773 4.025-6.385 14.988-6.385 10.27 0 9.713 2.359 9.574 2.916.002.554-.552 2.08-2.912 2.08zM299.75 236.469c.832 0 1.805.834 1.109 2.221-.832 1.111-1.109 1.666-1.525 2.498-.555.832-1.805 1.248-3.33 1.248h-5.689c-1.109 0-1.109-.971-.557-1.939a10.25 10.25 0 0 1 1.111-1.807c.416-.691 1.109-2.221 3.33-2.221h5.551zM133.777 252.428c-2.081 0-2.914 1.389-3.33 2.082-.278.555-.694.971-1.249 1.943-.417.971-.278 1.939.277 1.939h5.967c1.805 0 2.775-.555 3.33-1.387.556-.971.694-1.25 1.527-2.637.971-1.389-.278-1.943-.973-1.943l-5.549.003zM271.719 258.119c3.607-5.83 1.387-2.223 6.521-10.408 4.996-8.328-2.914-9.992-10.686-9.992-11.936 0-15.545.555-15.545.555-1.246 0-2.912 1.109-3.605 2.498l-14.434 23.314c-.832 1.387-.557 2.496.557 2.773 0 0 3.469.277 15.402.277 16.378.003 17.903-3.05 21.79-9.017zm-4.858-10.408s-6.244 9.852-6.662 10.408c-.555.832-2.498 3.469-5.412 3.469h-6.105c-1.111 0-1.666-.139-.971-1.25l9.99-15.959a2.432 2.432 0 0 1 1.943-.971h5.967c1.944 0 2.498 2.082 1.25 4.303zM176.103 253.539c-3.469 0-4.579.275-7.632.416-1.249 0-2.914.971-3.608 2.357l-2.914 4.996c-3.607 5.689 4.163 6.105 10.27 6.105 9.854 0 14.571-2.775 14.571-2.775 1.249-.555 2.776-2.082 3.47-3.33l6.383-10.408c.694-1.109.973-3.053.276-4.162 0 0-.832-1.941-10.685-1.941-9.714 0-13.6 1.525-13.6 1.525-1.11.555-2.498 1.525-2.915 2.082-.276.83.278 1.387 1.389 1.387h14.432c1.111 0 1.527.973.972 1.941-1.249 1.666-3.33 1.807-3.33 1.807h-7.079zm5.551 6.799v.139c-.972 1.391-2.915 2.639-4.024 2.639h-5.551c-1.11 0-1.527-1.248-.556-2.639v-.139c.972-1.525 2.914-2.775 4.024-2.775h5.551c1.111-.001 1.527 1.249.556 2.775zM156.953 251.873c.971-1.389 2.497-2.359 3.607-2.359H165c.694 0 2.914-.139 3.054-1.523.139-2.223-4.58-2.775-6.384-2.775-6.522 0-10.131.277-13.878 5.828-2.914 4.438-5.828 9.02-7.771 12.35-1.665 3.055-.138 3.748.833 3.748h4.024c1.526 0 2.637-.139 4.996-3.748l7.079-11.521zM127.949 248.959l-6.245 10.408c-.833 1.107 0 1.664.693 1.664h2.221c.694 0 1.665.834.832 2.082-.692 1.389-.832 1.941-1.524 2.773-.557.973-1.527 1.25-3.192 1.25h-2.637c-1.804 0-.833-2.637-.833-2.637-2.636 2.914-8.742 2.914-15.126 2.914-6.105 0-14.016 0-10.407-6.105l7.771-12.49c1.249-2.082 2.22-2.912 3.469-3.469 0 0 .277-.418 3.606-.418 2.222 0 5.135 0 2.639 3.887l-7.078 11.52c-.832 1.111-.416 2.221.833 2.221h4.855c1.249 0 2.776-1.107 3.747-2.221 0 0 3.608-6.244 6.801-11.379.832-1.248 2.914-4.025 4.995-4.025h3.471c1.526 0 3.329.418 1.109 4.025zM191.091 272.967h11.518l2.359.139c1.248 0 2.775-1.107 3.469-2.498l2.359-3.469c-1.527.277-3.053.277-4.857.277-5.828 0-13.875 0-10.27-6.105l7.494-12.072c.971-1.389 2.498-2.914 3.469-3.471 0-.275.555-.416 3.748-.416 2.08 0 5.412-.555 2.496 3.887l-6.66 11.102c-.832 1.111-.555 2.221.555 2.221h4.721c.971 0 2.773-1.107 3.469-2.221l6.938-11.104c.693-1.387 2.359-2.912 3.471-3.469 0 0 .557-.416 3.744-.416 1.807 0 5.414-.555 2.5 3.885l-5.828 9.301c-.277.416-.416.555-.693 1.248l-7.354 11.934c-.832 1.25-2.359 2.777-3.469 3.471 0 0-4.857 2.775-14.57 2.775h-1.389c-9.021-.277-8.604-.834-9.16-1.25-.556-.139-1.111-.971-.973-2.082.137-.974 1.386-1.667 2.913-1.667zM99.501 117.4c-.278 0-.278.142-.417.279-12.073 16.93-19.15 28.17-26.645 42.047l-.832 1.526-.14.556c-.693 1.389-.555 2.914.417 4.164 4.439 6.938 29.281 15.125 84.65 15.125 41.354 0 85.345-6.66 85.345-19.148 0-11.797-43.297-18.873-85.345-18.873-14.017 0-27.755 1.804-31.641 2.498 3.747-5.829 19.567-27.062 19.567-27.2.277-.276.277-.276.277-.416v-.276c-.277-.14-.416-.279-.693-.279l-44.543-.003zm16.097 44.547c0-2.497 15.682-6.105 40.938-6.105s40.8 3.608 40.8 6.105c0 2.775-15.543 6.244-40.8 6.244-25.257.002-40.938-3.466-40.938-6.244z' />
                                    <path d='M130.863 224.258c7.077.139 206.217 7.076 210.659-63.559 3.606-58.425-142.938-52.873-142.938-52.873-.275 0-1.248 0-1.248.693 0 .832.416.973.973.973 40.658 0 106.717 16.234 104.635 51.207-1.666 28.311-53.289 61.613-172.08 61.613-.555 0-1.11.557-1.11.973-.001.418.415.834 1.109.973zM313.488 219.123h-3.884v-.832h8.88v.832h-3.607v6.938h-1.389zM320.428 218.291h1.664l2.916 6.521 3.053-6.521h1.664v7.77h-1.11v-6.383h-.138l-2.915 6.383h-1.111l-2.914-6.383v6.383h-1.109z' />
                                  </g>
                                </svg>
                              ) : (
                                <span className='p-1 px-2'>{t?.type}</span>
                              )}
                            </div>
                            <div className='rounded-r p-1 px-2 h-6 bg-gray-600 text-white text-sm font-light leading-none flex items-center justify-center'>
                              {t?.quality}
                            </div>
                          </div>
                          <div className=''></div>
                        </a>
                      ))}
                  </div>
                </div>
                <div
                  className='flex items-center gap-x-3 font-semibold text-gray-400 max-w-[94vw] overflow-x-scroll'
                  style={{ scrollbarWidth: 'none' }}
                >
                  {movie &&
                    movie?.genres &&
                    movie?.genres.length > 0 &&
                    movie?.genres.map((g: string, i: number) => (
                      <div
                        key={i}
                        className='flex items-center gap-x-3'
                      >
                        <div className='text-lg'>{g}</div>
                        {movie?.genres.length - 1 !== i && (
                          <div className='w-1 h-1 bg-gray-100 rounded-full'></div>
                        )}
                      </div>
                    ))}
                </div>
                {movie && <div
                  className='relative mt-6 h-24 w-24 group/playBtn'
                  onClick={() => setIsPlaying((prev) => true)}
                >
                  <div className='absolute top-0 z-20 left-0 w-24 h-24 rounded-full bg-white flex justify-center items-center hover:bg-gray-100 cursor-pointer'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='#111'
                      viewBox='0 0 24 24'
                      strokeWidth={1.5}
                      stroke='#111'
                      className='w-20 h-20 ps-2 group-hover/playBtn:border-2 group-hover/playBtn:text-gray-50 border-black/40 rounded-full group-hover/playBtn:rotate-[360deg] transition-all ease-in-out duration-500'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z'
                      />
                    </svg>
                  </div>
                  <div className='z-10 bg-zinc-800/80 rounded-full text-gray-50 border-2 border-collapse border-gray-50 px-4 absolute top-0 left-0 h-24 group-hover/playBtn:pl-28 group-hover/playBtn:opacity-100 opacity-0 transition-all ease-in-out duration-300 text-xl flex items-center hover:font-bold cursor-pointer'>
                    Play
                  </div>
                </div>}
              </div>
            </div>
            {movie && <div className='absolute bottom-2 left-1/2 -translate-x-1/2 flex items-end justify-center text-lg font-semibold text-white gap-x-3'>
              <div
                className={`p-1.5 cursor-pointer border-gray-50 ${relatedDisp ? 'border-b-4' : ''
                  }`}
                onClick={() => {
                  setRelatedDisp((prev) => true);
                  setDetailsDisp((prev) => false);
                  scrollBy({
                    top: height,
                    behavior: 'smooth',
                  });
                }}
              >
                {'Related'}
              </div>
              <div
                className={`p-1.5 cursor-pointer border-gray-50 ${detailsDisp ? 'border-b-4' : ''
                  }`}
                onClick={() => {
                  setDetailsDisp((prev) => true);
                  setRelatedDisp((prev) => false);
                  scrollBy({
                    top: height,
                    behavior: 'smooth',
                  });
                }}
              >
                {'Details'}
              </div>
            </div>}
          </div>
          {movie && <RelatedMovies
            width={width}
            height={height}
            genres={suggesedGenres}
          />}
        </div>
      )}
    </div>
  );
}

const RelatedMovies = ({
  width,
  height,
  genres,
}: {
  width: number;
  height: number;
  genres: string[];
}) => {
  const { moviesList, pageSize, firstItemId, hasMore, loadMore, isLoading, isValidating } =
    useMovieSuggestions({ genres });

  useEffect(() => {
    // Track the moviesList, auto choose the
    // if the movieslist is not empty and longer than pageSize
    // scroll the movie that has the firstItemId to the furthest left
    if (moviesList.length > pageSize) {
      const el = document.getElementById(`ns-${firstItemId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      }
    }
  }, [moviesList]);

  return (
    <HorizontalList
      width={width}
      height={height}
      moviesList={moviesList}
      loadMore={loadMore}
      hasMore={hasMore}
      isLoading={false}
      isValidating={false}
    >
      <div className='flex items-center ps-2 lg:ps-5'>
        <div className='text-white text-2xl font-bold'>{'Also watched'}</div>
      </div>
    </HorizontalList>
  );
};

function propertiesToArray(obj: any) {
  const isObject = (val: any) => val && typeof val === 'object' && !Array.isArray(val);

  const addDelimiter = (a: any, b: any) => (a ? `${a}.${b}` : b);

  const paths: any = (obj = {}, head = '') => {
    return Object.entries(obj).reduce((product, [key, value]) => {
      let fullPath = addDelimiter(head, key);
      return isObject(value)
        ? product.concat(paths(value, fullPath))
        : product.concat(fullPath);
    }, []);
  };

  return paths(obj);
}

const MovieDescription = (props: any) => {
  const [wasExpandedTriggered, setWasExpandedTriggered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { description } = props;

  const descriptionCutOff = (description: string) => {
    if (description.length > 400) {
      if (description[400] === ' ') {
        return description.slice(0, 400) + '...';
      } else {
        return description.slice(0, 400).split(' ').slice(0, -1).join(' ') + '...';
      }
    } else {
      return description;
    }
  };

  useEffect(() => {
    if (description && description.length > 400) {
      setExpanded(false);
    }
  }, [description]);

  return (
    <div className='w-1/2 mb-3'>
      <motion.div
        className='w-full flex flex-wrap items-start text-gray-300'
        initial={{
          height: wasExpandedTriggered ? '10em' : 'fit-content',
        }}
        animate={{
          height: wasExpandedTriggered ? 'fit-content' : '10em',
        }}
        transition={{
          duration: 0.6,
          type: 'spring',
        }}
      >
        <span className='me-1'>Plot summary:</span>
        {String(expanded ? description : descriptionCutOff(description || ''))
          .split(' ')
          .map((w: string, i: number) => (
            <span
              className='me-1'
              key={i}
            >
              {w}
            </span>
          ))}
        {description && description.length > 400 && (
          <span
            className='text-green-500 cursor-pointer'
            onClick={() => {
              setWasExpandedTriggered(true);
              let counter = 8;
              const interval = setInterval(() => {
                if (counter === 0) {
                  setExpanded((curr) => !curr);
                  clearInterval(interval);
                }
                counter--;
              }, 100);
            }}
          >{`See ${expanded ? ' less' : ' more'}`}</span>
        )}
      </motion.div>
    </div>
  );
};

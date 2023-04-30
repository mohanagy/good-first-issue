import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css";

interface Label {
  color: string;
  default: boolean;
  description: string;
  id: number;
  name: string;
  node_id: string;
  url: string;
}
interface Issue {
  id: number;
  title: string;
  labels: Label[];
  html_url: string;
  body: string;
  user: {
    login: string;
    avatar_url: string;
  };
  repository_url: string;
  languages: string[];
}
const languages = [
  "Typescript",
  "Javascript",
  "HTML",
  "CSS",
  "Python",
  "Java",
  "C++",
  "C#",
  "PHP",
  "Ruby",
  "Go",
  "Swift",
  "Kotlin",
  "Rust",
  "Scala",
  "Dart",
  "Haskell",
  "Lua",
  "Perl",
  "R",
  "Shell",
  "Vue",
  "React",
  "Angular",
  "Svelte",
  "Ember",
  "Django",
  "Rails",
  "Laravel",
  "Spring",
  "Flask",
  "Express",
  "Next.js",
];

function App() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["Typescript", "Javascript", "HTML"]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [pagesToShow] = useState(2);
  const [maxPaginationButtons] = useState(5);
  const [loading, setLoading] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      const languages = selectedLanguages.map((language) => `language:"${language}"`).join(" ");
      const query = `label:"Good First Issue" label:"help wanted" ${languages} state:"open" archived:false`;
      const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}+type:issue+state:open &page=${page}&per_page=30`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `token ${import.meta.env.VITE_GITHUB_API_KEY}`,
        },
      });
      const _issues = await Promise.all(
        response.data.items.map(async (issue: any) => {
          const repoName = getRepoName(issue.repository_url);

          const usedLanguages = await getRepoLanguages(repoName);
          return {
            ...issue,
            languages: usedLanguages,
          };
        })
      );
      setIssues(_issues);
      setTotalPages(Math.ceil(response.data.total_count / 30));
      setLoading(false);
    };
    fetchIssues();
  }, [page, selectedLanguages]);
  useEffect(() => {
    document.addEventListener("click", handleClickOutside, false);
    return () => {
      document.removeEventListener("click", handleClickOutside, false);
    };
  }, []);
  const getPageNumbers = () => {
    const startPage = Math.max(1, page - pagesToShow);
    const endPage = Math.min(totalPages, page + pagesToShow);
    const pageNumberArray = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);

    if (pageNumberArray.length < maxPaginationButtons) {
      if (startPage === 1) {
        while (pageNumberArray.length < maxPaginationButtons && pageNumberArray[pageNumberArray.length - 1] < totalPages) {
          pageNumberArray.push(pageNumberArray[pageNumberArray.length - 1] + 1);
        }
      } else {
        while (pageNumberArray.length < maxPaginationButtons && pageNumberArray[0] > 1) {
          pageNumberArray.unshift(pageNumberArray[0] - 1);
        }
      }
    }

    return pageNumberArray;
  };

  const handleClickOutside = (event: any) => {
    if ((wrapperRef.current && !wrapperRef.current.contains(event.target)) || event.target.localName !== "input") {
      setOpenDropdown(false);
    }
  };
  function renderSkeletonRows(count: number) {
    return Array.from({ length: count }).map((_, i) => (
      <tr key={i}>
        <td className="px-4 py-4 text-sm font-medium whitespace-nowrap animate-pulse">
          <div className="h-5 w-1/2 bg-gray-200 mt-3 mb-6 rounded"></div>
        </td>
        <td className="px-4 py-4 text-sm font-medium whitespace-nowrap animate-pulse">
          <div className="h-5 w-1/2 bg-gray-200 mt-3 mb-6 rounded"></div>
        </td>
        <td className="px-4 py-4 text-sm font-medium whitespace-nowrap animate-pulse">
          <div className="h-5 w-1/2 bg-gray-200 mt-3 mb-6 rounded"></div>
        </td>
        <td className="px-12 py-4 text-sm font-medium whitespace-nowrap animate-pulse">
          <div className="h-5 w-1/2 bg-gray-200 mt-3 mb-6 rounded"></div>
        </td>
        <td className="px-4 py-4 text-sm whitespace-nowrap animate-pulse">
          <div className="h-10 w-10 bg-gray-200 mt-3 mb-6 rounded-full"></div>
        </td>
        <td className="px-4 py-4 text-sm whitespace-nowrap animate-pulse">
          <div className="h-5 w-1/2 bg-gray-200 mt-3 mb-6 rounded"></div>
        </td>
      </tr>
    ));
  }
  const getRepoName = (url: string) => {
    const repoName = url.split("/repos/")[1] || "No Repo Name";

    return repoName;
  };

  const getRepoLanguages = async (repo: string) => {
    const api = `https://api.github.com/repos/${repo}/languages`;
    const { data } = await axios.get(api, {
      headers: {
        Authorization: `token ${import.meta.env.VITE_GITHUB_API_KEY}`,
      },
    });
    const languages = Object.keys(data);
    return languages;
  };

  return (
    <section className="mx-auto px-4">
      <h2 className="text-lg font-medium text-gray-800 dark:text-white">Github Issues Hunter</h2>
      <div className="flex flex-col items-center relative">
        <div className="w-full  svelte-1l8159u" ref={wrapperRef} id="dropdown-container">
          <div className="my-2 p-1 flex border border-gray-200 bg-white rounded svelte-1l8159u">
            <div className="flex flex-auto flex-wrap">
              {selectedLanguages.map((language) => (
                <div className="flex justify-center items-center m-1 font-medium py-1 px-2 bg-white rounded-full text-teal-700 bg-teal-100 border border-teal-300 ">
                  <div className="text-xs font-normal leading-none max-w-full flex-initial">{language}</div>
                  <div className="flex flex-auto flex-row-reverse">
                    <div
                      onClick={() => {
                        setSelectedLanguages(selectedLanguages.filter((l) => l !== language));
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="100%"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        className="feather feather-x cursor-pointer hover:text-teal-400 rounded-full w-4 h-4 ml-2"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex-1">
                <input
                  placeholder=""
                  className="bg-transparent p-1 px-2 appearance-none outline-none h-full w-full text-gray-800"
                  onClick={() => {
                    setOpenDropdown(!openDropdown);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        {openDropdown ? (
          <div className="absolute shadow top-100 bg-white z-40 w-full lef-0 rounded max-h-select overflow-y-auto svelte-5uyqqj dropdown" id="dropdown">
            <div className="flex flex-col w-full">
              {languages.map((language) => (
                <div
                  className={`cursor-pointer w-full border-gray-100 rounded-t border-b hover:bg-teal-100 ${
                    selectedLanguages.includes(language) ? "bg-teal-100" : ""
                  } dropdown-item`}
                  onClick={(e) => {
                    e.stopPropagation();

                    if (selectedLanguages.includes(language)) {
                      setSelectedLanguages(selectedLanguages.filter((l) => l !== language));
                    } else {
                      setSelectedLanguages([...selectedLanguages, language]);
                    }
                  }}
                >
                  <div className="flex w-full items-center p-2 pl-2 border-transparent border-l-2 relative hover:border-teal-100">
                    <div className="w-full items-center flex">
                      <div className="mx-2 leading-6 text-gray-500 dark:text-gray-400 ">{language} </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex flex-col mt-6 w-full">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-auto w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="py-3.5 px-4 text-sm font-normal text-center text-gray-500 dark:text-gray-400">
                      Title
                    </th>
                    <th scope="col" className="py-3.5 px-4 text-sm font-normal text-center text-gray-500 dark:text-gray-400">
                      Repo Name
                    </th>
                    <th scope="col" className="py-3.5 px-4 text-sm font-normal text-center text-gray-500 dark:text-gray-400">
                      Repo Languages
                    </th>

                    <th scope="col" className="px-12 py-3.5 text-sm font-normal text-center text-gray-500 dark:text-gray-400">
                      Labels
                    </th>

                    <th scope="col" className="px-4 py-3.5 text-sm font-normal text-center text-gray-500 dark:text-gray-400">
                      Users
                    </th>

                    <th scope="col" className="px-4 py-3.5 text-sm font-normal text-center text-gray-500 dark:text-gray-400">
                      Url
                    </th>
                  </tr>
                </thead>
                <tbody className="min-w-full bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900">
                  {!loading
                    ? issues.map((issue) => (
                        <tr>
                          <td className="px-4 py-4 text-sm font-medium whitespace-nowrap">
                            <div>
                              <p className="text-sm font-normal text-gray-600 dark:text-gray-400">{issue.title}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm font-medium whitespace-nowrap">
                            <div>
                              <a href={`https://github.com/${getRepoName(issue.repository_url)}`}>{getRepoName(issue.repository_url).split("/")[1]}</a>
                            </div>
                          </td>
                          <td className="px-12 py-4 text-sm font-medium whitespace-nowrap">
                            {issue.languages.map((label) => (
                              // add space between labels
                              <div className="inline px-3 py-1 text-sm font-normal rounded-full text-emerald-500 gap-x-2 bg-emerald-100/60 dark:bg-gray-800 mx-1">
                                {label}
                              </div>
                            ))}
                          </td>

                          <td className="px-12 py-4 text-sm font-medium whitespace-nowrap">
                            {issue.labels.map((label) => (
                              // add space between labels
                              <div className="inline px-3 py-1 text-sm font-normal rounded-full text-emerald-500 gap-x-2 bg-emerald-100/60 dark:bg-gray-800 mx-1">
                                {label.name}
                              </div>
                            ))}
                          </td>

                          <td className="px-4 py-4 text-sm whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                className="object-cover w-12 h-10 -mx-1 border-2 border-white rounded-full dark:border-gray-700 shrink-0"
                                src={issue.user.avatar_url}
                                alt=""
                              />
                            </div>
                          </td>

                          <td className="px-4 py-4 text-sm whitespace-nowrap">
                            <a href={issue.html_url}>Open</a>
                          </td>
                        </tr>
                      ))
                    : renderSkeletonRows(10)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {issues.length ? (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            type="button"
            className="flex items-center px-5 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md gap-x-2 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-5 h-5 rtl:-scale-x-100">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
            </svg>

            <span>previous</span>
          </button>

          <div className="items-center hidden md:flex gap-x-3">
            {page > pagesToShow + 1 && (
              <>
                <button type="button" onClick={() => setPage(1)} className="px-2 py-1 text-sm text-blue-500 rounded-md dark:bg-gray-800 bg-blue-100/60">
                  First
                </button>
                <span className="px-2 py-1 text-sm">...</span>
              </>
            )}
            {getPageNumbers().map((pageNumber) => (
              <button
                type="button"
                onClick={() => setPage(pageNumber)}
                className={`px-2 py-1 text-sm ${pageNumber === page ? "text-white bg-blue-500" : "text-blue-500"} rounded-md dark:bg-gray-800 bg-blue-100/60`}
              >
                {pageNumber}
              </button>
            ))}
            {page < totalPages - pagesToShow && (
              <>
                <span className="px-2 py-1 text-sm">...</span>
                <button type="button" onClick={() => setPage(totalPages)} className="px-2 py-1 text-sm text-blue-500 rounded-md dark:bg-gray-800 bg-blue-100/60">
                  Last
                </button>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setPage(page + 1);
            }}
            className="flex items-center px-5 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md gap-x-2 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <span>Next</span>

            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-5 h-5 rtl:-scale-x-100">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
          </button>
        </div>
      ) : null}
    </section>
  );
}

export default App;

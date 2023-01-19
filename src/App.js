import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import classNames from "classnames";

function App() {
  const client = "94762aedec92495a98b47e48185df337";
  const url_red = "http://localhost:3000/";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const res = "token";
  const [token, setToken] = useState("");
  const [searchKey, setSearchKey] = useState("rock");
  const [result, setResult] = useState([]);
  const [marketValue, setMarketValue] = useState("");
  const [open, setOpen] = useState(false);
  const [check, setCheck] = useState("");
  const [availMarket, setAvailMarket] = useState([]);
  const [showList, setShowList] = useState(false);
  const [page, setPage] = useState(0);
  const [grid, setGrid] = useState(true);
  const [artist, setArtist] = useState("");
  const [isTrack, setIsTrack] = useState(true);
  const [ind, setInd] = useState();
  // const getToken = () => {
  //     let urlParams = new URLSearchParams(window.location.hash.replace("#","?"));
  //     let token = urlParams.get('access_token');
  // }

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
      token = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        .split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem("token", token);
    }
    setToken(token);

    getID(token);
    getAllTracks(token);
    output(result);
  }, []);

  const maxPage = Math.ceil(availMarket.length / 5);
  const onNextPage = () => setPage((page + 1) % maxPage);
  const onPrevPage = () => setPage((page + 5 - 1) % maxPage);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const getAvailableMarket = async () => {
    let { data } = await axios.get("https://api.spotify.com/v1/markets", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    setAvailMarket(data.markets);
  };
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
  };

  const getID = async (token) => {
    const { data } = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log("yooo", data.id);
  };
  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
  };

  const getAllTracks = async (token) => {
    try {
      const { data } = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          q: searchKey,
          type: "track",
          ...(marketValue && { market: marketValue }),
        },
      });
      setResult(data.tracks.items);
    } catch (error) {
      alert(error);
    }
  };

  const getAllArtist = async () => {
    const { data } = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: {
        q: searchKey,
        type: "artist",
      },
    });
    setArtist(data.artists.items);
    console.log(data.artists.items);
  };
  const output = (result) => {
    return result.map((x) => (
      <div className={classNames(grid ? "gridDetail" : "listDetail")}>
        <a
          href={x.album?.uri}
          style={{ display: "flex", flexDirection: grid ? "column" : "row" }}
        >
          <img
            width={grid ? "100px" : "40px"}
            src={isTrack ? x.album?.images[2]?.url : x?.images[2]?.url}
            alt="album name"
          />

          <p
            style={{
              fontSize: "12px",
              color: "white",
              marginLeft: grid ? "0px" : "20px",
            }}
          >
            {x.name}
          </p>
        </a>
      </div>
    ));
  };
  const handleRadioChange = (e) => {
    setCheck(e.target.value);
  };
  const resetRadioState = () => {
    setCheck("");
  };
  const handleFilterSubmit = (e) => {
    console.log(check, "idhar");
    handleClose();
    if (check == "") {
      getAllTracks(token);
      output(result);
    }
    if (check == "true") {
      {
        isTrack ? sortPopularity(result) : sortPopularity(artist);
      }
    }
    if (marketValue !== "") {
      isTrack ? getAllTracks(token) : getAllArtist(token);
      isTrack ? output(result) : output(artist);
    }
  };
  const sortPopularity = (result) => {
    console.log(result, "array");
    if (check == "") {
      output(result);
    }
    result.sort((a, b) => (a.popularity > b.popularity ? -1 : 1));
    setResult(result);
    output(result);
    console.log("after sort", result);
  };
  const showMarket = () => {
    getAvailableMarket();
  };

  return (
    <div className="App">
      <div class="container">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          {!token ? (
            <>
              <h1>Let's get you started</h1>
              <button>
                <a
                  href={`${AUTH_ENDPOINT}?client_id=${client}&redirect_uri=${url_red}&response_type=${res}`}
                >
                  Login to Quarntify
                </a>
              </button>
            </>
          ) : (
            <>
              <div
                className="header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  marginRight: "8rem",
                  padding: "1rem",
                }}
              >
                <div></div>
                <button style={{ cursor: "pointer" }} onClick={logout}>
                  Logout
                </button>
              </div>
              <></>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginLeft: "4rem",
                }}
              >
                <h1>Search track of your choice</h1>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    margin: "1rem",
                  }}
                >
                  <button
                    className="filter"
                    style={{
                      color: "white",
                      textAlign: "center",
                      gap: "2rem",
                      height: "2rem",
                      backgroundColor: "#808080",
                    }}
                    onClick={handleOpen}
                  >
                    Filter
                  </button>
                  <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                  >
                    <Box sx={style}>
                      <Typography
                        id="modal-modal-title"
                        variant="h6"
                        component="h2"
                      >
                        Sort
                      </Typography>
                      <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        <form onSubmit={handleFilterSubmit}>
                          <ul style={{ paddingLeft: "24px" }}>
                            <li>
                              {" "}
                              <input
                                type="radio"
                                value="true"
                                checked={check === "true"}
                                onChange={handleRadioChange}
                                label="search"
                                autoFocus
                              />{" "}
                              Popularity (Hight to Low)
                            </li>
                          </ul>
                          <>
                            {" "}
                            <div
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                setShowList(!showList);
                                showMarket();
                              }}
                            >
                              {showList ? (
                                <ArrowDropDownIcon />
                              ) : (
                                <ArrowDropDownIcon
                                  style={{ transform: "rotate(180deg)" }}
                                />
                              )}
                              Market
                            </div>
                            <>
                              {" "}
                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                }}
                              >
                                {showList ? (
                                  <div>
                                    <Grid container spacing="2">
                                      {availMarket
                                        .slice(page * 5, 5 * (page + 1))
                                        .map((content, key) => (
                                          <Grid item {...{ key }}>
                                            <Paper className="paper">
                                              <div
                                                type="button"
                                                style={{
                                                  cursor: "pointer",
                                                  width: "100%",
                                                  height: "100%",
                                                  display: "flex",
                                                  alignItems: "center",
                                                  justifyContent: "center",
                                                  backgroundColor:
                                                    key == ind ? "grey" : null,
                                                }}
                                                onClick={() => {
                                                  setMarketValue(content);
                                                  setInd(key);
                                                }}
                                              >
                                                {content}
                                              </div>
                                            </Paper>
                                          </Grid>
                                        ))}
                                    </Grid>
                                    <div>
                                      <Button
                                        onClick={onPrevPage}
                                        disabled={!page}
                                      >
                                        &lt;Prev
                                      </Button>
                                      <Button
                                        onClick={onNextPage}
                                        disabled={
                                          page ==
                                          Math.ceil(availMarket.length / 5) - 1
                                        }
                                      >
                                        Next&gt;
                                      </Button>
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            </>
                          </>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              width: "100%",
                            }}
                          >
                            <Button
                              onClick={resetRadioState}
                              style={{ background: "white", color: "black" }}
                            >
                              Reset Radio
                            </Button>
                            <button
                              className="filter"
                              type="submit"
                              onClick={handleFilterSubmit}
                            >
                              Submit
                            </button>
                          </div>
                        </form>
                      </Typography>
                    </Box>
                  </Modal>
                </div>
              </div>
            </>
          )}

          {token ? (
            <>
              <form
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="text"
                    onChange={(e) => {
                      setSearchKey(e.target.value);
                      setIsTrack(true);
                    }}
                    placeholder="Search for Track"
                  />
                  <input
                    style={{ width: "60%", marginTop: "10px" }}
                    type="text"
                    onChange={(e) => {
                      setSearchKey(e.target.value);
                      setIsTrack(false);
                    }}
                    placeholder="Seach Artist"
                  />{" "}
                </div>
                <div
                  style={{
                    display: "flex",

                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <button
                    style={{ margin: "8px" }}
                    type={"submit"}
                    onClick={() =>
                      isTrack ? getAllTracks(token) : getAllArtist(token)
                    }
                  >
                    Search
                  </button>
                  <button
                    onClick={() => setGrid(!grid)}
                    style={{ width: "80%", height: "60%" }}
                  >
                    Tap for {grid ? "List" : " Grid"} View
                  </button>{" "}
                </div>
              </form>
              {result && isTrack ? (
                <div className={grid ? "view" : "list"}>{output(result)}</div>
              ) : null}
              {artist && !isTrack ? (
                <div className={grid ? "view" : "list"}>{output(artist)}</div>
              ) : null}
            </>
          ) : (
            <h2>Please login</h2>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

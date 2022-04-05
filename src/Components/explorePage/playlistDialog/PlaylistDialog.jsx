import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/authorization-context";
import { useDBdata } from "../../../context/db-data-context";
import {
  addToWatchLaterVideo,
  addVideoToPlaylist,
  getPlaylists,
  removeFromWatchLaterVideo,
  removeVideoFromPlaylist,
} from "../../../utilities/server-request/server-request";
import { AddPlaylistForm } from "./AddPlaylistForm";
import "./playlistDialog.css";

export function PlaylistDialog({ videoSelected, setShowPlaylistDialog }) {
  const { authToken } = useAuth();
  const { dataState, dataDispatch } = useDBdata();
  const [showCreatePlaylistForm, setShowCreatePlaylistForm] = useState(false);

  const isVideoWatchLater =
    dataState.watchLaterVideos?.findIndex(
      (item) => item._id === videoSelected._id
    ) >= 0;
  const navigate = useNavigate();
  useEffect(() => {
    if (authToken) {
      if (!dataState.playlists) {
        (async () => {
          const playlistsData = await getPlaylists(authToken);
          dataDispatch({
            type: "PLAYLISTS",
            payload: playlistsData.data.playlists,
          });
        })();
      }
    }
  }, []);

  async function updateWatchLaterVideo(data, isChecked) {
    if (authToken) {
      if (!isChecked) {
        const watchLaterVideoData = await removeFromWatchLaterVideo(
          authToken,
          data._id
        );
        dataDispatch({
          type: "WATCH_LATER_VIDEOS",
          payload: watchLaterVideoData.data.watchlater,
        });
      } else {
        const watchLaterVideoData = await addToWatchLaterVideo(authToken, data);
        dataDispatch({
          type: "WATCH_LATER_VIDEOS",
          payload: watchLaterVideoData.data.watchlater,
        });
      }
    } else {
      localStorage.setItem("lastRoute", "/explore");
      navigate("/login");
    }
  }

  async function updateVideoInPlaylist(isChecked, playlistID, videoData) {
    if (!isChecked) {
      const updatedList = await removeVideoFromPlaylist(
        authToken,
        playlistID,
        videoData._id
      );
      dataDispatch({
        type: "PLAYLISTS",
        payload: dataState.playlists.map((item) =>
          item._id === playlistID ? updatedList.data.playlist : item
        ),
      });
    } else {
      const updatedList = await addVideoToPlaylist(
        authToken,
        playlistID,
        videoData
      );
      dataDispatch({
        type: "PLAYLISTS",
        payload: dataState.playlists.map((item) =>
          item._id === playlistID ? updatedList.data.playlist : item
        ),
      });
    }
  }

  return (
    <div className="dialog-window">
      <div className="dialog-box playlist-dialog">
        <div className="dialog-header">
          <p className=" txt-bold txt-md">Playlists</p>
          <button
            className="btn-link material-icons py-1"
            onClick={() => setShowPlaylistDialog(false)}
          >
            clear
          </button>
          <hr className="w-100" />
        </div>
        <div className="dialog-body">
          <p
            key="watchLater"
            className="txt checkbox-input-group auth-checkbox"
          >
            <input
              type="checkbox"
              name="playlist"
              value="watchLater"
              checked={isVideoWatchLater}
              onChange={(e) =>
                updateWatchLaterVideo(videoSelected, e.target.checked)
              }
            />
            <label htmlFor="playlist">Watch Later</label>
          </p>
          {dataState.playlists?.map((item) => (
            <p
              key={item._id}
              className="txt checkbox-input-group auth-checkbox"
            >
              <input
                type="checkbox"
                name="playlist"
                value={item._id}
                onChange={(e) =>
                  updateVideoInPlaylist(
                    e.target.checked,
                    item._id,
                    videoSelected
                  )
                }
                checked={
                  dataState.playlists
                    .find((playlist) => playlist._id === item._id)
                    .videos.findIndex(
                      (video) => video._id === videoSelected._id
                    ) >= 0
                    ? true
                    : false
                }
              />
              <label htmlFor="playlist">{item.title}</label>
            </p>
          ))}
        </div>
        <div className="mx-auto w-100">
          <hr />
          {!showCreatePlaylistForm && (
            <button
              className=" btn-link btn-w-icon btn-create-playlist"
              onClick={() => setShowCreatePlaylistForm(true)}
            >
              <i className="material-icons">add</i>Create Playlist
            </button>
          )}
          {showCreatePlaylistForm && (
            <AddPlaylistForm
              videoSelected={videoSelected}
              setShowCreatePlaylistForm={setShowCreatePlaylistForm}
              setShowPlaylistDialog={setShowPlaylistDialog}
            />
          )}
        </div>
      </div>
    </div>
  );
}

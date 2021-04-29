import Head from 'next/head'
import React, { useEffect, useRef, useState } from 'react'
import { Button, Col, Form, OverlayTrigger, Row, Spinner, Tooltip } from 'react-bootstrap'
import AsyncSelect from 'react-select/async';
import useSWR from 'swr';
import { SongCard } from '../components/SongCard';
import { ListResponse } from '../types/ListResponse';
import { Song } from '../types/Song';


export default function Home() {
  const [selectedSong, changeSelectedSong] = useState<{ label: string; value: number } | undefined>(undefined);
  const [lyricText, changeLyric] = useState<string>("");
  const [lyricCommittedText, changeCommittedLyric] = useState<string>("");
  const [mode, changeMode] = useState<"song_mode" | "text_mode">("song_mode");
  const [loading, changeLoading] = useState(false);
  const [broken, changeBroken] = useState(false);
  const { data, error, isValidating } = useSWR('/api/areualive');
  const timeoutRef = useRef(undefined);
  const selectSoundTimeoutRef = useRef(undefined);
  const [relatedSongs, changeRelatedSongs] = useState<undefined | ListResponse<{ song: Song, score: number }>>(undefined);

  useEffect(() => {
    changeLyric("");
    changeCommittedLyric("");
    changeSelectedSong(undefined);
  }, [mode, changeLyric, changeSelectedSong, changeCommittedLyric]);

  useEffect(() => {
    if (timeoutRef.current)
      clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      changeCommittedLyric(lyricText);
    }, 500);
  }, [lyricText, changeCommittedLyric, timeoutRef])

  useEffect(() => {
    changeBroken(false);
    changeLoading(true);
    if (mode === "song_mode") {
      if (!selectedSong) {
        changeLoading(false);
        return;
      }
      fetch(`/api/song/${selectedSong.value}/related`).then((res) => res.json())
        .then((data: ListResponse<{ song: Song, score: number }>) => {
          changeRelatedSongs(data);
          changeLoading(false);
        }).catch(e => {
          changeLoading(false);
          changeBroken(true);
        })
    } else {
      if (!lyricCommittedText) {
        changeLoading(false);
        return;
      }
      fetch(`/api/related?query=${encodeURIComponent(lyricCommittedText)}`).then((res) => res.json())
        .then((data: ListResponse<{ song: Song, score: number }>) => {
          changeRelatedSongs(data);
          changeLoading(false);
        }).catch(e => {
          changeLoading(false);
          changeBroken(true);
        })
    }
  }, [mode, selectedSong, lyricCommittedText, changeRelatedSongs, changeLoading, changeBroken]);

  const loadSongs = (val, callback) => {
    if (selectSoundTimeoutRef.current)
      clearTimeout(selectSoundTimeoutRef.current);
    
    selectSoundTimeoutRef.current = setTimeout(async () => {
      const data = (await fetch(`/api/song?query=${encodeURIComponent(val)}`).then(res => res.json())) as { results: Song[] };
      callback(data.results.map((song) => ({ value: song.id, label: `${song.name} - ${song.artist}` })));
    }, 500);
  }

  return (
    <div className="bg-light min-vh-100 d-flex flex-column flex-md-row">
      <Head>
        <title>Lyrec - Recommendations based on Lyrics</title>
      </Head>
      <div style={{ maxWidth: "25rem", flexShrink: 0, position: "sticky", top: "calc(-1 * (1.375rem + 1.5vw + 2.5rem))", zIndex: 10 }} className="py-4 px-4 border bg-white w-100">
        <div style={{ position: "sticky", top: "calc(1.5rem + 1px)" }}>
          <div className="d-flex justify-content-between align-items-center" style={{ height: "calc(1.375rem + 1.5vw + 1rem)" }}>
            <h1 className="text-primary m-0">LyRec</h1>
            <OverlayTrigger
              placement={"bottom"}
              overlay={
                <Tooltip id={`tooltip-bottom`}>
                  {isValidating ? "Still checking how the backend is doing (this might take a while since it likes to nap)" : error ? "The backend is unavailable! Maybe try refreshing?" : "The backend is all good!"}
                </Tooltip>
              }
            >
              <p className="badge bg-white text-dark border m-0">Backend Status: {isValidating ? <Spinner animation="grow" size="sm"/> : error ? "❌" : "✅"}</p>
            </OverlayTrigger>
          </div>
          <Form>
            <Form.Group className="py-3">
              <Form.Check type="radio" name="mode" value="song_mode" label={'By Songs'} inline id="song-mode" checked={mode === "song_mode"} onChange={() => changeMode("song_mode")} />
              <Form.Check type="radio" name="mode" value="text_mode" label={'By Text'} inline id="text-mode" checked={mode === "text_mode"} onChange={() => changeMode("text_mode")} />
            </Form.Group>
            <Form.Group className={mode === "song_mode" ? "" : "d-none"}>
              <AsyncSelect placeholder="select a song..." loadOptions={loadSongs} value={selectedSong} onChange={(newVal) => changeSelectedSong(newVal)} isDisabled={error || isValidating} />
            </Form.Group>
            <Form.Group className={mode === "text_mode" ? "" : "d-none"}>
              <Form.Control as="textarea" rows={3} placeholder="enter some text..." value={lyricText} onChange={e => changeLyric(e.target.value)} disabled={error || isValidating} />
            </Form.Group>
            {!data && <p className="text-muted pt-3 small animate__animated animate__fadeIn animate__delay-2s">You can't really do anything until the backend status has a green check mark! Thanks for your patience.</p>}
          </Form>
        </div>

      </div>
      <a href="https://github.com/aditya-pethe/LyRec" target="_blank" className="btn btn-outline-primary position-fixed mx-4 my-4 bg-white d-flex align-items-center text-primary" style={{ left: 0, bottom: 0, zIndex: 11 }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-info" style={{ marginRight: "0.5rem" }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        About LyRec
      </a>
      <div className="py-4 px-4" style={{ overflow: "auto" }}>
        <div style={{ height: "calc(1.375rem + 1.5vw + 1rem)" }} className="d-flex align-items-center">
          {loading ? (
            <Spinner animation="border" variant="primary" />
          ) : relatedSongs ? (
            <h4 className="text-dark m-0">Showing {relatedSongs?.size} out of {relatedSongs?.total_size} results</h4>
          ) : <h4 className="text-dark m-0">Select a song or enter some text</h4>}
        </div>
        <Row
          xs={1}
          sm={2}
          lg={3}
          xl={3}
          style={{ opacity: loading ? 0.5 : 1 }}
        >
          {relatedSongs?.results.map((songAndScore) => (
            <Col key={songAndScore.song.id} className="pb-4">
              <SongCard
                songName={songAndScore.song.name}
                artist={songAndScore.song.artist}
                lyrics={songAndScore.song.lyrics}
                score={songAndScore.score}
              />
            </Col>
          ))}
        </Row>
      </div>

    </div>
  )
}

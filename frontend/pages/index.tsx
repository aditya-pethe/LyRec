import Head from 'next/head'
import React, { useEffect, useRef, useState } from 'react'
import { Col, Form, Row, Spinner } from 'react-bootstrap'
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
  const { data, error, isValidating } = useSWR('/api/ping');
  const timeoutRef = useRef(undefined);
  const [relatedSongs, changeRelatedSongs] = useState<undefined | ListResponse<{ song: Song, score: number}>>(undefined);

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
      if (!selectedSong ) {
        changeLoading(false);
        return;
      }
      fetch(`/api/song/${selectedSong.value}/related`).then((res) => res.json())
        .then((data: ListResponse<{ song: Song, score: number}>) => {
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
        .then((data: ListResponse<{ song: Song, score: number}>) => {
          changeRelatedSongs(data);
          changeLoading(false);
        }).catch(e => {
          changeLoading(false);
          changeBroken(true);
        })
    }
  }, [mode, selectedSong, lyricCommittedText, changeRelatedSongs, changeLoading, changeBroken]);

  const loadSongs = async (val) => {
    const data = (await fetch(`/api/song?query=${encodeURIComponent(val)}`).then(res => res.json())) as { results: Song[] };
    return data.results.map((song) => ({ value: song.id, label: `${song.name} - ${song.artist}`}));
  }

  return (
    <div className="bg-light min-vh-100 d-flex flex-row">
      <Head>
        <title>Lyrec - Recommendations based on Lyrics</title>
      </Head>
      <div style={{ width: "25rem", flexShrink: 0 }} className="py-4 px-4 border bg-white">
        <div className="d-flex justify-content-between align-items-center" style={{height: "calc(1.375rem + 1.5vw + 1rem)"}}>
          <h1 className="text-primary m-0">LyRec</h1>
          <span className="badge bg-white text-dark border">Backend Status: {isValidating ? "💤" : error ? "😵" : "😄"}</span>
        </div>
        <Form>
          <Form.Group className="py-3">
            <Form.Check type="radio" name="mode" value="song_mode" label={'By Songs'} inline id="song-mode" checked={mode === "song_mode"} onChange={() => changeMode("song_mode")}/>
            <Form.Check type="radio" name="mode" value="text_mode" label={'By Text'} inline id="text-mode" checked={mode === "text_mode"} onChange={() => changeMode("text_mode")}/>
          </Form.Group>
          <Form.Group className={mode === "song_mode" ? "" : "d-none"}>
            <AsyncSelect placeholder="select a song..." loadOptions={loadSongs} value={selectedSong} onChange={(newVal) => changeSelectedSong(newVal)}/>
          </Form.Group>
          <Form.Group className={mode === "text_mode" ? "" : "d-none"}>
            <Form.Control as="textarea" rows={3} placeholder="enter some text..." value={lyricText} onChange={e => changeLyric(e.target.value)} />
          </Form.Group>
        </Form>
        
      </div>
      <div className="py-4 px-4" style={{ overflow: "auto", height:"100vh"}}>
        <div style={{height: "calc(1.375rem + 1.5vw + 1rem)"}} className="d-flex align-items-center">
          {loading ? (
            <Spinner animation="border" variant="primary" />
          ) : relatedSongs ? (
            <h4 className="text-dark m-0">Showing {relatedSongs?.size} out {relatedSongs?.total_size} results</h4>
          ) : <h4 className="text-dark m-0">Select a thing</h4>}
        </div>
        <Row 
          xs={1}
          sm={2}
          lg={3}
          xl={3}
          style={{ opacity: loading ? 0.5 : 1}}
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

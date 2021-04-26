import React, { useState } from "react";
import { Badge, Card, Modal } from "react-bootstrap";

export interface SongCardProps {
    songName: string;
    artist: string;
    score: number;
    lyrics: string;
}
export const SongCard: React.FC<SongCardProps> = ({ songName, artist, score, lyrics}) => {
    const [show, changeShow] = useState(false);
    return (
        <>
            <Card className="h-100" style={{ cursor: "pointer" }} onClick={() => changeShow(true)}>
                <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start" style={{gap: "1rem"}}>
                        <div>
                            <Card.Title>
                                {songName}
                            </Card.Title>
                            <Card.Subtitle>
                                {artist}
                            </Card.Subtitle>
                        </div>
                        <Badge variant="light" className="border text-dark">
                            {(score * 100).toFixed(2)}%
                        </Badge>
                    </div>
                    <div className="serif py-3" style={{ flex: 1, height: "100%", maxHeight: "30rem", overflow: "hidden", whiteSpace: "break-spaces", fontSize: "1.15rem"}}>
                        {lyrics}
                        <div style={{height: "2rem", background: "linear-gradient(to bottom, transparent, white)", width: "calc(100% - 2rem)", position: "absolute", marginBottom: "1rem", bottom: 0}}/>
                    </div>
                </Card.Body>
            </Card>
            <Modal show={show} onHide={() => changeShow(false)}>
                <Modal.Body>
                    <div className="d-flex justify-content-between align-items-start" style={{gap: "1rem"}}>
                        <div>
                            <Card.Title>
                                {songName}
                            </Card.Title>
                            <Card.Subtitle>
                                {artist}
                            </Card.Subtitle>
                        </div>
                        <Badge variant="light" className="border text-dark">
                            {(score * 100).toFixed(2)}%
                        </Badge>
                    </div>
                    <div className="serif py-3" style={{whiteSpace: "break-spaces", fontSize: "1.15rem"}}>
                        {lyrics}
                    </div>        
                </Modal.Body>
            </Modal>
        </>
    )
}
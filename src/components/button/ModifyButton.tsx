import React, { useState } from 'react'
import axios from 'axios'
import { Button, VStack, useDisclosure } from '@yamada-ui/react'
import TrackList from '../TrackList'
import EditTrackModal from '../modal/EditTrackModal'
import ReplaceButton from './ReplaceButton'
import { Track } from '../../types/Track'

export default function ModifyButton({ setlistId, setShowIframe, children }: { setlistId: string; setShowIframe: React.Dispatch<React.SetStateAction<boolean>>; children: React.ReactNode }) {

    const [tracks, setTracks] = useState<Track[]>([])
    const [editingTrack, setEditingTrack] = useState<Track | null>(null)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [isReplaced, setIsReplaced] = useState<boolean>(false)

    const [modSongs, setModSongs] = useState<Track[]>([])

    const handleClick = async () => {
        setShowIframe(false);

        // const url = `http://localhost:3000/api/modify/${setlistId}`
        const url = `https://setlistconverter_backend.tapioka.workers.dev/api/modify/${setlistId}`


        const response = await axios.get(url)
        console.log(response)

        const length: number = response.data.tracks.items.length
        const newTracks: Track[] = []

        for (let i = 0; i < length; i++) {
            const track = response.data.tracks.items[i].track
            const artistNames: string = track.artists
                .map((artist: { name: string }) => artist.name)
                .join(', ')

            newTracks.push({
                id: track.id,
                name: track.name,
                imageUrl: track.album.images[1].url,
                artists: artistNames,
                isReplaced: false
            })
        }
        setTracks(newTracks)
        return response
    }

    const handleDelete = (id: string) => {
        setTracks(tracks.filter(track => track.id !== id))
        console.log(tracks)
    }

    const handleEdit = async (track: Track) => {
        // const url = `http://localhost:3000/api/song/search/${track.artists}/${track.name}`
        const url = `https://setlistconverter_backend.tapioka.workers.dev/api/song/search/${track.artists}/${track.name}`

        const response = await axios.get(url)
        // modSongsにresponse.data.tracksの各種情報を追加
        const length: number = response.data.tracks.items.length

        const newModSongs: Track[] = [];

        for (let i = 0; i < length; i++) {
            const track = response.data.tracks.items[i]
            const artistNames: string = track.artists
                .map((artist: { name: string }) => artist.name)
                .join(', ')

            newModSongs.push({
                id: track.id,
                name: track.name,
                imageUrl: track.album.images[1].url,
                artists: artistNames,
                isReplaced: false
            })
        }
        setModSongs(newModSongs)

        setEditingTrack(track)
        onOpen()
    }

    const handleSaveEdit = () => {
        if (editingTrack) {
            setTracks(tracks.map(track =>
                track.id === editingTrack.id ? editingTrack : track
            ))
            onClose()
        }
    }




    return (
        <VStack align="center" width="full">

            <Button onClick={handleClick} colorScheme="primary" size="md">
                {children}
            </Button>

            {tracks.length > 0 && (
                <TrackList tracks={tracks} onDelete={handleDelete} onEdit={handleEdit} />
            )}

            <EditTrackModal
                isOpen={isOpen}
                onClose={onClose}
                editingTrack={editingTrack}
                setTracks={setTracks}
                setIsReplaced={setIsReplaced}
                onSave={handleSaveEdit}
                modSongs={modSongs}
            />
            <ReplaceButton setlistId={setlistId} tracks={tracks} isReplaced={isReplaced}>{'プレイリストの再作成'} </ReplaceButton>
        </VStack>
    )
}
import React from 'react'
import axios from 'axios'
import { useState } from 'react'
import {
    Button,
    Card,
    CardBody,
    HStack,
    Heading,
    Image,
    Text,
    VStack,
    Container,
    Box,
    IconButton,
} from '@yamada-ui/react'
import { FiTrash2, FiEdit } from 'react-icons/fi'

type Track = {
    id: string
    name: string
    imageUrl: string
    artists: string
}

export default function ModifyButton({ setlistId, children }: { setlistId: string; children: React.ReactNode }) {
    const [tracks, setTracks] = useState<Track[]>([])

    const handleClick = async () => {
        const url = `http://localhost:3000/api/modify/${setlistId}`

        const response = await axios.get(url)
        const length: number = response.data.body.tracks.items.length
        const newTracks: Track[] = []

        for (let i = 0; i < length; i++) {
            const track = response.data.body.tracks.items[i].track
            const artistNames: string = track.artists
                .map((artist: { name: string }) => artist.name)
                .join(', ')

            newTracks.push({
                id: track.id,
                name: track.name,
                imageUrl: track.album.images[1].url,
                artists: artistNames,
            })
        }
        setTracks(newTracks)
        return response
    }

    const handleDelete = (id: string) => {
        setTracks(tracks.filter(track => track.id !== id))
        console.log(tracks)
    }

    const handleEdit = (id: string) => {
        // 編集機能の実装（この例ではコンソールログのみ）
        console.log(`Editing track with id: ${id}`)
    }

    return (
        <VStack  align="center" width="full">
            <Button
                onClick={handleClick}
                colorScheme="primary"
                size="md"
            >
                {children}
            </Button>

            {tracks.length > 0 && (
                <Container maxW="container.md">
                    <VStack  align="stretch">
                        {tracks.map((track) => (
                            <Card key={track.id} variant="elevated">
                                <CardBody>
                                    <HStack  justifyContent="space-between">
                                        <HStack >
                                            <Image
                                                src={track.imageUrl}
                                                alt={track.name}
                                                objectFit="cover"
                                                boxSize="100px"
                                                borderRadius="md"
                                            />
                                            <Box>
                                                <Heading size="md" >{track.name}</Heading>
                                                <Text fontSize="sm" color="muted" >{track.artists}</Text>
                                            </Box>
                                        </HStack>
                                        <HStack>
                                            <IconButton
                                                aria-label="Edit track"
                                                icon={<FiEdit />}
                                                onClick={() => handleEdit(track.id)}
                                                variant="ghost"
                                                colorScheme="blue"
                                            />
                                            <IconButton
                                                aria-label="Delete track"
                                                icon={<FiTrash2 />}
                                                onClick={() => handleDelete(track.id)}
                                                variant="ghost"
                                                colorScheme="red"
                                            />
                                        </HStack>
                                    </HStack>
                                </CardBody>
                            </Card>
                        ))}
                    </VStack>
                </Container>
            )}
        </VStack>
    )
}
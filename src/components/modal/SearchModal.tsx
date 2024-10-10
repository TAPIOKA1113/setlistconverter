import { useState } from 'react'
import {
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Button,
    VStack,
    IconButton,
    Divider,
    useLoading,
    Text,
    Box,
    Image,
    Flex,
    Card,
    CardBody,
    CardFooter,
    SimpleGrid,
    useDisclosure
} from '@yamada-ui/react'
import { FiPlus, FiCheck } from 'react-icons/fi'
import ConfirmModal from './ConfirmModal'

type EditTrackModalProps = {
    isOpen: boolean
    onClose: () => void
    artistName: string
    data: any
    selectedSite: string
}

type Setlist = {
    concert_name: string
    date: string
    venue: string
    concert_id: string,
}

export default function SearchModal({ isOpen, onClose, artistName, data, selectedSite }: EditTrackModalProps) {
    const { page } = useLoading()

    const [setlists, setSetlists] = useState<Setlist[]>([])
    const [selectedSetlist, setSelectedSetlist] = useState<Setlist | null>(null)


    const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure()


    const handleClick = async (artist: any) => {
        if (selectedSite === "setlistfm") {
            onClose()
            page.start()

            const response = await fetch(`https://0gri69uq0g.execute-api.ap-northeast-1.amazonaws.com/prod/fetch-html/${selectedSite}?artist=${encodeURIComponent(artist.name)}`)
            const data = await response.json()

            console.log(data)
            let fetchedSetlists: Setlist[] = []

            if (data.setlist && Array.isArray(data.setlist)) {
                data.setlist.map((item: any) => {
                    if (item.sets && item.sets.set && item.sets.set.length > 0) {
                        fetchedSetlists.push({
                            concert_name: item.tour?.name || item.artist.name,
                            date: item.eventDate,
                            venue: item.venue.name + '  (' + item.venue.city.country.name + ')',
                            concert_id: item.id
                        })
                    }
                })
            }

            setSetlists(fetchedSetlists)
            page.finish()
        } else if (selectedSite === "livefans") {
            onClose()
            page.start()

            const response = await fetch(`https://0gri69uq0g.execute-api.ap-northeast-1.amazonaws.com/prod/fetch-html/${selectedSite}?artist=${encodeURIComponent(artist.name)}`)
            const fetchedSetlists: Setlist[] = await response.json()

            setSetlists(fetchedSetlists)


            page.finish()

        }
    }

    const handleSetlistSelect = (setlist: Setlist) => {
        setSelectedSetlist(setlist)
        console.log(setlist.concert_id)
        onConfirmOpen()
    }

    const viewSongInfo = (setlist: Setlist) => {
        console.log(setlist)
    }


    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size='3xl'>
                <ModalOverlay />
                <ModalHeader>{artistName} の検索結果</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {data && data.artists && (
                        <VStack align="stretch" divider={<Divider />}>
                            {data.artists.items.map((artist: any) => (
                                <Flex key={artist.id} alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Text fontWeight="bold">{artist.name}</Text>
                                        {artist.images && artist.images[0] && (
                                            <Image src={artist.images[0].url} alt={artist.name} boxSize="70px" objectFit="cover" />
                                        )}
                                    </Box>
                                    <IconButton
                                        aria-label="Replace track"
                                        icon={<FiPlus />}
                                        onClick={() => handleClick(artist)}
                                        variant="ghost"
                                        colorScheme="green"
                                    />
                                </Flex>
                            ))}
                        </VStack>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="yellow" variant="ghost" onClick={onClose} mr={3}>
                        キャンセル
                    </Button>
                </ModalFooter>
            </Modal>
            {setlists.length > 0 && (
                <Box mt={6}>
                    <Text fontWeight="bold" mb={4}>セットリストを選択してください：</Text>
                    <SimpleGrid columns={2} >
                        {setlists.map((setlist) => (
                            <Card key={setlist.concert_id} variant="outline">
                                <CardBody>
                                    <Text fontWeight="bold">{setlist.concert_name}</Text>
                                    <Text>日付: {setlist.date}</Text>
                                    <Text>会場: {setlist.venue}</Text>
                                </CardBody>
                                <CardFooter justifyContent="flex-end" gap={2}>
                                    {selectedSite === "setlistfm" && (
                                        <Button
                                            colorScheme={selectedSetlist?.concert_id === setlist.concert_id ? "green" : "gray"}
                                            onClick={() => viewSongInfo(setlist)}
                                        >
                                            詳細を見る
                                        </Button>
                                    )}

                                    <Button
                                        colorScheme={selectedSetlist?.concert_id === setlist.concert_id ? "green" : "gray"}
                                        onClick={() => handleSetlistSelect(setlist)}
                                        leftIcon={selectedSetlist?.concert_id === setlist.concert_id ? <FiCheck /> : undefined}
                                    >
                                        {selectedSetlist?.concert_id === setlist.concert_id ? "選択中" : "選択"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </SimpleGrid>
                </Box>
            )}
            {selectedSetlist && (
                <ConfirmModal isOpen={isConfirmOpen} onClose={onConfirmClose} setlist_id={selectedSetlist.concert_id} selectedSite={selectedSite} />
            )}
        </>
    )
}
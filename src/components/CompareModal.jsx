import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
    Checkbox,
    User,
    Image
} from "@heroui/react";
import { getPropertiesBySlugs } from '../lib/properties';

export default function CompareModal() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [favorites, setFavorites] = useState([]);
    const [selectedSlugs, setSelectedSlugs] = useState([]);
    const [propertiesData, setPropertiesData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('selection'); // 'selection' | 'comparison'

    useEffect(() => {
        if (isOpen) {
            loadFavorites();
            setView('selection');
            setSelectedSlugs([]);
        }
    }, [isOpen]);

    const loadFavorites = async () => {
        setLoading(true);
        const storedFavorites = JSON.parse(localStorage.getItem('realstate_favorites') || '[]');

        if (storedFavorites.length > 0) {
            const props = await getPropertiesBySlugs(storedFavorites);
            setFavorites(props);
        } else {
            setFavorites([]);
        }
        setLoading(false);
    };

    const handleSelect = (slug) => {
        if (selectedSlugs.includes(slug)) {
            setSelectedSlugs(selectedSlugs.filter(s => s !== slug));
        } else {
            if (selectedSlugs.length < 3) {
                setSelectedSlugs([...selectedSlugs, slug]);
            }
        }
    };

    const handleCompare = () => {
        const selectedProps = favorites.filter(p => selectedSlugs.includes(p.slug));
        setPropertiesData(selectedProps);
        setView('comparison');
    };

    return (
        <>
            {/* Trigger Button (Mobile Bottom Nav Style) */}
            <div onClick={onOpen} className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 group text-gray-500 hover:text-[#0D4715]">
                <svg className="w-6 h-6 mb-1 group-hover:text-[#0D4715]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
                <span className="text-xs group-hover:text-[#0D4715]">Comparar</span>
            </div>

            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size={view === 'comparison' ? "5xl" : "md"}
                scrollBehavior="inside"
                placement="center"
                backdrop="blur"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {view === 'selection' ? 'Seleccioná propiedades para comparar' : 'Comparación de Propiedades'}
                                {view === 'selection' && <span className="text-sm font-normal text-gray-500">Elegí hasta 3 de tus favoritos</span>}
                            </ModalHeader>

                            <ModalBody>
                                {view === 'selection' ? (
                                    <div className="flex flex-col gap-3">
                                        {loading ? (
                                            <div className="text-center py-8">Cargando favoritos...</div>
                                        ) : favorites.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                No tenés propiedades en favoritos para comparar.
                                            </div>
                                        ) : (
                                            favorites.map((prop) => (
                                                <div
                                                    key={prop.slug}
                                                    className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${selectedSlugs.includes(prop.slug) ? 'border-[#0D4715] bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}
                                                    onClick={() => handleSelect(prop.slug)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Image
                                                            src={prop.data.image}
                                                            alt={prop.data.title}
                                                            className="w-16 h-16 object-cover rounded-md"
                                                            removeWrapper
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-sm line-clamp-1">{prop.data.title}</span>
                                                            <span className="text-xs text-gray-500">{prop.data.currency} {prop.data.price.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                    <Checkbox
                                                        isSelected={selectedSlugs.includes(prop.slug)}
                                                        color="success"
                                                        radius="full"
                                                        onValueChange={() => handleSelect(prop.slug)}
                                                    />
                                                </div>
                                            ))
                                        )}
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left text-gray-500">
                                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3">Característica</th>
                                                    {propertiesData.map(p => (
                                                        <th key={p.slug} className="px-4 py-3 min-w-[200px]">
                                                            <div className="flex flex-col items-center gap-2">
                                                                <Image src={p.data.image} className="w-full h-24 object-cover rounded-lg" removeWrapper />
                                                                <span className="line-clamp-2 text-center">{p.data.title}</span>
                                                            </div>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="bg-white border-b">
                                                    <th className="px-4 py-4 font-medium text-gray-900">Precio</th>
                                                    {propertiesData.map(p => (
                                                        <td key={p.slug} className="px-4 py-4 text-center font-bold text-[#0D4715]">
                                                            {p.data.currency} {p.data.price.toLocaleString()}
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr className="bg-gray-50 border-b">
                                                    <th className="px-4 py-4 font-medium text-gray-900">Ubicación</th>
                                                    {propertiesData.map(p => (
                                                        <td key={p.slug} className="px-4 py-4 text-center">{p.data.city}</td>
                                                    ))}
                                                </tr>
                                                <tr className="bg-white border-b">
                                                    <th className="px-4 py-4 font-medium text-gray-900">Superficie Total</th>
                                                    {propertiesData.map(p => (
                                                        <td key={p.slug} className="px-4 py-4 text-center">{p.data.totalArea} m²</td>
                                                    ))}
                                                </tr>
                                                <tr className="bg-gray-50 border-b">
                                                    <th className="px-4 py-4 font-medium text-gray-900">Superficie Cubierta</th>
                                                    {propertiesData.map(p => (
                                                        <td key={p.slug} className="px-4 py-4 text-center">{p.data.coveredArea} m²</td>
                                                    ))}
                                                </tr>
                                                <tr className="bg-white border-b">
                                                    <th className="px-4 py-4 font-medium text-gray-900">Ambientes</th>
                                                    {propertiesData.map(p => (
                                                        <td key={p.slug} className="px-4 py-4 text-center">{p.data.ambientes}</td>
                                                    ))}
                                                </tr>
                                                <tr className="bg-gray-50 border-b">
                                                    <th className="px-4 py-4 font-medium text-gray-900">Baños</th>
                                                    {propertiesData.map(p => (
                                                        <td key={p.slug} className="px-4 py-4 text-center">{p.data.bathrooms}</td>
                                                    ))}
                                                </tr>
                                                <tr className="bg-white border-b">
                                                    <th className="px-4 py-4 font-medium text-gray-900">Cochera</th>
                                                    {propertiesData.map(p => (
                                                        <td key={p.slug} className="px-4 py-4 text-center">{p.data.garage ? 'Sí' : 'No'}</td>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </ModalBody>

                            <ModalFooter>
                                {view === 'selection' ? (
                                    <Button
                                        color="success"
                                        onPress={handleCompare}
                                        isDisabled={selectedSlugs.length < 2}
                                        className="w-full text-white font-bold"
                                    >
                                        Comparar ({selectedSlugs.length})
                                    </Button>
                                ) : (
                                    <Button variant="light" onPress={() => setView('selection')}>
                                        Volver a selección
                                    </Button>
                                )}
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}

import prisma from "../prisma/prisma.js";

// Create new seat type
const createSeatType = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newSeatType = await prisma.seatType.create({
            data: {
                name,
                description,
            },
        });
        res.status(201).json(newSeatType);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getSeatTypes = async (req, res) => {
    try {
        const seatTypes = await prisma.seatType.findMany();
        res.json(seatTypes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const  getSeatTypeById = async (req, res) => {
    try {
        const { id } = req.params;
        const seatType = await prisma.seatType.findUnique({
            where: { id: Number(id) },
        });
        if (!seatType) {
            return res.status(404).json({ error: "Seat type not found" });
        }
        res.json(seatType);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const updateSeatType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const updatedSeatType = await prisma.seatType.update({
            where: { id: Number(id) },
            data: {
                name,
                description,
            },
        });
        res.json(updatedSeatType);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const deleteSeatType = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSeatType = await prisma.seatType.delete({
            where: { id: Number(id) },
        });
        res.json(deletedSeatType);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export default { createSeatType, getSeatTypes, getSeatTypeById, updateSeatType,deleteSeatType };
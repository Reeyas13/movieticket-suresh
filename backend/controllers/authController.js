import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma/prisma.js";
import { getImageUrl } from "../helpers/ImageHandler.js";

/**
 * User Login Controller
 * @route POST /api/auth/login
 */

export default {
  login :async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include:{
        filmhall: true
      }
    });

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    console.log(user);

    // Generate JWT token
    
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        filmhallId: user?.filmhall?.id
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Return user data and token (excluding password)
    const { password: _, ...userData } = user;
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
},
registerUser:async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate request
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password, 
      parseInt(process.env.BCRYPT_SALT_ROUNDS)
    );

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Return user data (excluding password) and token
    const { password: _, ...userData } = newUser;

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
},
registerCinema:async (req, res) => {
  try {
    const { 
      adminName,
      adminEmail, 
      adminPassword, 
      adminPhone,
      cinemaName, 
      address, 
      city, 
      description,
      imageUrl
    } = req.body;

    // Validate request
    if (!adminName || !adminEmail || !adminPassword || !cinemaName || !address || !city) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields for cinema registration'
      });
    }
 const imageUrls = req.files.map(file => getImageUrl(file.filename))
    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Use transaction to ensure both user and cinema are created successfully
    const result = await prisma.$transaction(async (prisma) => {
      // Hash password
      const hashedPassword = await bcrypt.hash(
        adminPassword, 
        parseInt(process.env.BCRYPT_SALT_ROUNDS)
      );

      // Create admin user
      const adminUser = await prisma.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          phone: adminPhone,
          role:"CINEMA"
        }
      });

      // Create cinema (FilmHall)
      const filmHall = await prisma.filmHall.create({
        data: {
          name: cinemaName,
          address,
          city,
          description,
          imageUrl,
          userId:adminUser.id
        }
      });

      // Return both created entities
      return { adminUser, filmHall };
    });

    // Generate JWT token for the admin user
    const token = jwt.sign(
      { 
        id: result.adminUser.id,
        email: result.adminUser.email,
        name: result.adminUser.name,
        role: result.adminUser.role,
        filmHallId :filmHall.id
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Return data (excluding password)
    const { password: _, ...userData } = result.adminUser;

    return res.status(201).json({
      success: true,
      message: 'Cinema and admin registered successfully',
      token,
      user: userData,
      cinema: result.filmHall
    });
  } catch (error) {
    console.error('Cinema registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
},


}


















// // exports.login = 

// /**
//  * User Registration Controller
//  * @route POST /api/auth/register/user
//  */
// exports.registerUser = 
// /**
//  * Cinema Registration Controller
//  * @route POST /api/auth/register/cinema
//  * @description Registers a new cinema (FilmHall) and admin user
//  */
// exports.registerCinema = 
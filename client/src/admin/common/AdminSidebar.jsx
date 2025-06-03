import React, { useEffect, useRef, useState } from "react";
import { href, Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
 FaChevronRight,
 FaFilm,
 FaChair,
 FaWheelchair,
 FaDoorOpen,
 FaCamera,
 FaTimes,
 FaStopwatch,  
} from "react-icons/fa";

import {
  FaBuilding,

} from "react-icons/fa";
const CustomDropDown = ({ name, subLinks, icon, open, href, sidebarWidth }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 100); // Very short delay to allow smooth movement
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        className={`relative ${!open && "hidden lg:block"}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          if (Array.isArray(subLinks) && subLinks.length > 0) {
            toggleDropdown();
          } else {
            navigate(href);
          }
        }}
        ref={dropdownRef}
      >
        <div
          className={`px-4 py-1 flex items-center text-white justify-between cursor-pointer rounded-md transition-colors duration-200 hover:underline`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`text-xl p-2 rounded-md text-white ${
                !open && location.pathname === href
                  ? "bg-[#60A5FA] text-white"
                  : "text-gray-500"
              }`}
            >
              {icon}
            </div>
            <span
              className={`font-medium text-white truncate transition-all duration-[330ms] ${
                !open && "opacity-0"
              }`}
            >
              {name}
            </span>
          </div>
          {Array.isArray(subLinks) && subLinks.length > 0 && open && (
            <div
              className={`text-sm text-gray-500 transition-transform duration-200 over:underline ${
                isDropdownOpen ? "rotate-90" : ""
              }`}
            >
              <FaChevronRight />
            </div>
          )}
        </div>

        {open && isDropdownOpen && (
          <div className="pl-4">
            {subLinks.map((subLink, index) => (
              <div
                key={index}
                className="px-4 py-2 cursor-pointer hover:bg-[#494E53]"
              >
                <Link
                  to={subLink.href}
                  className={`block w-full ${
                    window.location.pathname === subLink.href
                      ? "text-purple-500 "
                      : ""
                  }`}
                >
                  {subLink.name}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hover menu - positioned relative to viewport */}
      {!open && isHovered && Array.isArray(subLinks) && subLinks.length > 0 && (
        <div
          className="fixed bg-[#343A40] shadow-md border rounded-md py-2 w-48 z-50"
          style={{
            top: dropdownRef.current?.getBoundingClientRect().top || 0,
            left: dropdownRef.current?.getBoundingClientRect().right || 0,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {subLinks.map((subLink, index) => (
            <Link
              key={index}
              to={subLink.href}
              className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                location.pathname === subLink.href
                  ? "bg-indigo-500 text-white"
                  : "hover:bg-[#494E53] "
              }`}
            >
              {subLink.name}
            </Link>
          ))}
        </div>
      )}
    </>
  );
};
export default function AdminSidebar({ open, setOpen }) {
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);
  const sidebarRef = useRef(null);
 const links = [
  {
    href: "/cinema",
    icon: <FaHome />,
    name: "Dashboard",
    sub: [],
  },
  {
    href: "/admin/companies",
    icon: <FaDoorOpen />,
    name: "Hall",
    sub: [
      { name: "Cinema Halls", href: "/cinema/halls" },
    ],
  },
  {
    href: "/admin/seat-type",
    icon: <FaWheelchair />,
    name: "Seat Type",
    sub: [
      { name: "Seat Types", href: "/cinema/seat-type" },
    ],
  },
  {
    href: "/admin/seat",
    icon: <FaChair />,
    name: "Seat",
    sub: [
      { name: "Seats", href: "/cinema/seat" },
    ],
  },
  {
    href: "/admin/movie",
    icon: <FaFilm />,
    name: "Movie",
    sub: [
      { name: "Movies", href: "/cinema/movie" },
    ],
  },
  {
    href: "/admin/show-time",
    icon: <FaStopwatch />,
    name: "show time",
    sub: [
      { name: "Movies", href: "/cinema/show-time" },
    ],
  },
];
  return (
    <div
      ref={sidebarRef}
      className={`fixed z-10 overflow-x-hidden  inset-0 top-0 left-0 min-h-screen bg-[#343A40] shadow-md transition-all duration-300 
            ${open ? "w-64" : "w-0 lg:w-20"}
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:bg-gray-100
            [&::-webkit-scrollbar-thumb]:bg-gray-300
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-gray-400
            overflow-y-auto`}
    >
      <div className="px-4 py-4">
        <h2
          className={`text-center text-lg font-semibold transition-opacity  text-white duration-200 hidden lg:block`}
        >
          {open && "Super Admin"}
        </h2>
      </div>
      <div className="mt-4 space-y-2 text-white">
        {links.map((link, index) => (
          <CustomDropDown
            key={index}
            href={link.href}
            icon={link.icon}
            name={link.name}
            subLinks={link.sub}
            open={open}
            sidebarWidth={open ? "256px" : "80px"}
          />
        ))}
      </div>
    </div>
  );
}

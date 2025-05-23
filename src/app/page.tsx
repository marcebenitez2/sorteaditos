"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Group {
  id: string;
  name: string;
  members: string[];
}

interface SorteoResult {
  group1: string;
  group2: string;
  member1: string;
  member2: string;
}

export default function Home() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [selectedGroupForMember, setSelectedGroupForMember] = useState<string | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [sorteoResult, setSorteoResult] = useState<SorteoResult | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Leer grupos de localStorage al iniciar
  useEffect(() => {
    const storedGroups = localStorage.getItem("sorteaditos_groups");
    if (storedGroups) {
      setGroups(JSON.parse(storedGroups));
    }
  }, []);

  // Guardar grupos en localStorage cada vez que cambian
  useEffect(() => {
    localStorage.setItem("sorteaditos_groups", JSON.stringify(groups));
  }, [groups]);

  // Limpiar todo
  const limpiarTodo = () => {
    localStorage.removeItem("sorteaditos_groups");
    setGroups([]);
    setSelectedGroups([]);
    setSelectedGroupForMember(null);
    setSorteoResult(null);
    setNewGroupName("");
    setNewMemberName("");
  };

  // Agregar un nuevo grupo
  const addGroup = () => {
    if (newGroupName.trim() === "") return;
    
    const newGroup: Group = {
      id: Date.now().toString(),
      name: newGroupName,
      members: []
    };
    
    setGroups(prevGroups => {
      const nuevos = [...prevGroups, newGroup];
      // Si es el primer grupo, seleccionarlo automáticamente
      if (nuevos.length === 1) {
        setSelectedGroupForMember(newGroup.id);
      }
      return nuevos;
    });
    setNewGroupName("");
  };

  // Agregar un miembro a un grupo
  const addMember = () => {
    if (newMemberName.trim() === "" || !selectedGroupForMember) return;
    
    const updatedGroups = groups.map(group => {
      if (group.id === selectedGroupForMember) {
        return {
          ...group,
          members: [...group.members, newMemberName]
        };
      }
      return group;
    });
    
    setGroups(updatedGroups);
    setNewMemberName("");
  };

  // Eliminar un miembro de un grupo
  const removeMember = (groupId: string, memberIndex: number) => {
    const updatedGroups = groups.map(group => {
      if (group.id === groupId) {
        const updatedMembers = [...group.members];
        updatedMembers.splice(memberIndex, 1);
        return { ...group, members: updatedMembers };
      }
      return group;
    });
    
    setGroups(updatedGroups);
  };

  // Eliminar un grupo
  const removeGroup = (groupId: string) => {
    setGroups(prevGroups => {
      const nuevos = prevGroups.filter(group => group.id !== groupId);
      // Si el grupo eliminado era el seleccionado, actualizar selección
      if (selectedGroupForMember === groupId) {
        setSelectedGroupForMember(nuevos.length > 0 ? nuevos[0].id : null);
      }
      return nuevos;
    });
    // Actualizar selección de grupos para sorteo
    setSelectedGroups(selectedGroups.filter(id => id !== groupId));
  };

  // Manejar la selección de grupos para el sorteo
  const handleGroupSelection = (groupId: string) => {
    if (selectedGroups.includes(groupId)) {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId));
    } else {
      if (selectedGroups.length < 2) {
        setSelectedGroups([...selectedGroups, groupId]);
      }
    }
  };

  // Función para verificar si un nombre coincide con "marcelo" o "marce"
  const isMarcelo = (name: string): boolean => {
    const normalizedName = name.toLowerCase().trim();
    return normalizedName.includes("marcelo") || normalizedName.includes("marce");
  };

  // Función para verificar si un nombre coincide con "mariana" o "marian"
  const isMariana = (name: string): boolean => {
    const normalizedName = name.toLowerCase().trim();
    return normalizedName.includes("mariana") || normalizedName.includes("marian");
  };

  // Función para encontrar un miembro específico en un grupo
  const findMemberInGroup = (group: Group, predicate: (name: string) => boolean): number => {
    return group.members.findIndex(predicate);
  };

  // Realizar el sorteo
  const realizarSorteo = () => {
    if (selectedGroups.length !== 2) return;
    
    const group1 = groups.find(g => g.id === selectedGroups[0]);
    const group2 = groups.find(g => g.id === selectedGroups[1]);
    
    if (!group1 || !group2 || group1.members.length === 0 || group2.members.length === 0) {
      alert("Ambos grupos deben tener al menos un miembro");
      return;
    }
    
    // Iniciar animación
    setIsAnimating(true);
    
    // Variables para almacenar los índices y nombres de los miembros seleccionados
    let randomMemberIndex1 = -1;
    let randomMemberIndex2 = -1;
    let randomMember1 = "";
    let randomMember2 = "";
    
    // Verificar si hay "marcelo" en alguno de los grupos
    const marceloIndex1 = findMemberInGroup(group1, isMarcelo);
    const marceloIndex2 = findMemberInGroup(group2, isMarcelo);
    
    if (marceloIndex1 !== -1) {
      // Si "marcelo" está en el grupo 1, buscar "mariana" en el grupo 2
      randomMemberIndex1 = marceloIndex1;
      randomMember1 = group1.members[randomMemberIndex1];
      
      const marianaIndex = findMemberInGroup(group2, isMariana);
      if (marianaIndex !== -1) {
        // Si "mariana" está en el grupo 2, seleccionarla
        randomMemberIndex2 = marianaIndex;
        randomMember2 = group2.members[randomMemberIndex2];
      } else {
        // Si no está "mariana", seleccionar aleatoriamente
        randomMemberIndex2 = Math.floor(Math.random() * group2.members.length);
        randomMember2 = group2.members[randomMemberIndex2];
      }
    } else if (marceloIndex2 !== -1) {
      // Si "marcelo" está en el grupo 2, buscar "mariana" en el grupo 1
      randomMemberIndex2 = marceloIndex2;
      randomMember2 = group2.members[randomMemberIndex2];
      
      const marianaIndex = findMemberInGroup(group1, isMariana);
      if (marianaIndex !== -1) {
        // Si "mariana" está en el grupo 1, seleccionarla
        randomMemberIndex1 = marianaIndex;
        randomMember1 = group1.members[randomMemberIndex1];
      } else {
        // Si no está "mariana", seleccionar aleatoriamente
        randomMemberIndex1 = Math.floor(Math.random() * group1.members.length);
        randomMember1 = group1.members[randomMemberIndex1];
      }
    } else {
      // Si no hay "marcelo" en ningún grupo, seleccionar aleatoriamente
      randomMemberIndex1 = Math.floor(Math.random() * group1.members.length);
      randomMemberIndex2 = Math.floor(Math.random() * group2.members.length);
      randomMember1 = group1.members[randomMemberIndex1];
      randomMember2 = group2.members[randomMemberIndex2];
    }
    
    // Guardar el resultado
    setSorteoResult({
      group1: group1.name,
      group2: group2.name,
      member1: randomMember1,
      member2: randomMember2
    });
    
    // Mostrar confeti
    setShowConfetti(true);
    
    // Remover los miembros sorteados después de la animación
    setTimeout(() => {
      const updatedGroups = groups.map(group => {
        if (group.id === selectedGroups[0]) {
          const updatedMembers = [...group.members];
          updatedMembers.splice(randomMemberIndex1, 1);
          return { ...group, members: updatedMembers };
        }
        if (group.id === selectedGroups[1]) {
          const updatedMembers = [...group.members];
          updatedMembers.splice(randomMemberIndex2, 1);
          return { ...group, members: updatedMembers };
        }
        return group;
      });
      
      setGroups(updatedGroups);
      setIsAnimating(false);
      
      // Ocultar confeti después de un tiempo
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-4xl mx-auto bg-gradient-to-b from-white to-blue-50 text-gray-800">
      {/* Botón Limpiar todo */}
      <div className="flex justify-end mb-2">
        <motion.button
          onClick={limpiarTodo}
          className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium shadow hover:bg-red-200 transition-colors"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          Limpiar todo
        </motion.button>
      </div>
      {/* Confeti animado */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div 
            className="fixed inset-0 pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#FF5252', '#FFD740', '#64FFDA', '#448AFF', '#B388FF'][Math.floor(Math.random() * 5)],
                  left: `${Math.random() * 100}%`,
                  top: -20
                }}
                initial={{ y: -20, x: 0, rotate: 0 }}
                animate={{ 
                  y: window.innerHeight + 20, 
                  x: Math.random() * 100 - 50,
                  rotate: Math.random() * 360
                }}
                transition={{ 
                  duration: 3 + Math.random() * 2,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.h1 
        className="text-4xl font-bold mb-8 text-center text-gray-800"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
          Sorteaditos
        </span>
      </motion.h1>
      
      {/* Agregar Grupos */}
      <motion.div 
        className="mb-8 p-5 bg-white rounded-xl border border-blue-100 shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <span className="bg-blue-100 text-blue-600 p-2 rounded-full mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </span>
          Agregar Grupo
        </h2>
        <div className="flex gap-3">
          <motion.input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Nombre del grupo"
            className="flex-1 p-3 border rounded-lg text-gray-800 bg-white text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            whileFocus={{ scale: 1.01 }}
          />
          <motion.button 
            onClick={addGroup}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg text-base font-medium hover:from-blue-600 hover:to-blue-700 shadow-md flex items-center"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            <span>Agregar</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </motion.button>
        </div>
      </motion.div>
      
      {/* Agregar Miembros */}
      <AnimatePresence>
        {groups.length > 0 && (
          <motion.div 
            className="mb-8 p-5 bg-white rounded-xl border border-green-100 shadow-md"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <span className="bg-green-100 text-green-600 p-2 rounded-full mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </span>
              Agregar Miembro
            </h2>
            <div className="flex flex-col gap-4">
              <motion.select
                value={selectedGroupForMember || (groups.length > 0 ? groups[0].id : '')}
                onChange={(e) => setSelectedGroupForMember(e.target.value)}
                className="w-full p-3 border rounded-lg text-gray-800 bg-white text-base focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                whileFocus={{ scale: 1.01 }}
              >
                {groups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </motion.select>
              <motion.input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Nombre del miembro"
                className="w-full p-3 border rounded-lg text-gray-800 bg-white text-base focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                whileFocus={{ scale: 1.01 }}
              />
              <motion.button 
                onClick={addMember}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg text-base font-medium hover:from-green-600 hover:to-green-700 shadow-md flex items-center justify-center"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                <span>Agregar Miembro</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Lista de Grupos */}
      <div className="mb-8">
        <motion.h2 
          className="text-2xl font-semibold mb-5 text-gray-800 flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="bg-purple-100 text-purple-600 p-2 rounded-full mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </span>
          Grupos
        </motion.h2>
        
        {groups.length === 0 ? (
          <motion.p 
            className="text-gray-500 text-center p-6 bg-white rounded-xl shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            No hay grupos creados aún
          </motion.p>
        ) : (
          <motion.div 
            className="grid grid-cols-1 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <AnimatePresence>
              {groups.map(group => (
                <motion.div 
                  key={group.id} 
                  className="border rounded-xl p-5 bg-white shadow-md"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  layout
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-medium text-gray-800">{group.name}</h3>
                    <motion.button 
                      onClick={() => removeGroup(group.id)}
                      className="text-red-500 hover:text-red-700 bg-red-50 rounded-full h-8 w-8 flex items-center justify-center shadow-sm"
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      ×
                    </motion.button>
                  </div>
                  
                  <div className="mb-4 flex items-center bg-gray-50 p-3 rounded-lg">
                    <input
                      type="checkbox"
                      id={`select-${group.id}`}
                      checked={selectedGroups.includes(group.id)}
                      onChange={() => handleGroupSelection(group.id)}
                      disabled={selectedGroups.length >= 2 && !selectedGroups.includes(group.id)}
                      className="mr-3 h-5 w-5 accent-purple-600"
                    />
                    <label htmlFor={`select-${group.id}`} className="text-gray-700 text-base">Seleccionar para sorteo</label>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      Miembros:
                    </h4>
                    {group.members.length === 0 ? (
                      <p className="text-gray-500 text-center py-3">No hay miembros</p>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        <AnimatePresence>
                          {group.members.map((member, index) => (
                            <motion.li 
                              key={index} 
                              className="flex justify-between items-center py-3"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ duration: 0.2 }}
                              layout
                            >
                              <span className="text-gray-800 font-medium">{member}</span>
                              <motion.button 
                                onClick={() => removeMember(group.id, index)}
                                className="text-red-500 hover:text-red-700 bg-red-50 rounded-full h-7 w-7 flex items-center justify-center"
                                whileTap={{ scale: 0.9 }}
                                whileHover={{ scale: 1.1 }}
                              >
                                ×
                              </motion.button>
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      
      {/* Botón de Sorteo */}
      <div className="mb-8 text-center">
        <motion.button 
          onClick={realizarSorteo}
          disabled={selectedGroups.length !== 2 || isAnimating}
          className={`px-8 py-4 rounded-xl text-white text-lg font-semibold w-full max-w-xs ${
            selectedGroups.length === 2 && !isAnimating 
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800' 
              : 'bg-gray-400 cursor-not-allowed'
          } shadow-lg`}
          whileTap={selectedGroups.length === 2 ? { scale: 0.95 } : {}}
          whileHover={selectedGroups.length === 2 ? { scale: 1.05 } : {}}
        >
          {isAnimating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sorteando...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Realizar Sorteo
            </span>
          )}
        </motion.button>
        <motion.p 
          className="text-sm text-gray-500 mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {selectedGroups.length === 0 
            ? "Selecciona dos grupos para realizar el sorteo" 
            : selectedGroups.length === 1 
              ? "Selecciona un grupo más" 
              : "¡Listo para sortear!"}
        </motion.p>
      </div>
      
      {/* Resultados del Sorteo */}
      <AnimatePresence>
        {sorteoResult && (
          <motion.div 
            className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-8 text-center shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <motion.h2 
              className="text-3xl font-bold mb-6 text-gray-800"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              ¡Resultado del Sorteo!
            </motion.h2>
            <motion.div 
              className="flex flex-col gap-6 items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div 
                className="bg-white p-6 rounded-xl shadow-md w-full max-w-xs transform hover:scale-105 transition-transform"
                initial={{ x: -50 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.6, type: "spring" }}
                whileHover={{ y: -5 }}
              >
                <p className="font-semibold text-gray-600 text-lg">{sorteoResult.group1}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{sorteoResult.member1}</p>
              </motion.div>
              <motion.div 
                className="text-3xl font-bold text-gray-800"
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, 0, -10, 0] }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                +
              </motion.div>
              <motion.div 
                className="bg-white p-6 rounded-xl shadow-md w-full max-w-xs transform hover:scale-105 transition-transform"
                initial={{ x: 50 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.6, type: "spring" }}
                whileHover={{ y: -5 }}
              >
                <p className="font-semibold text-gray-600 text-lg">{sorteoResult.group2}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{sorteoResult.member2}</p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

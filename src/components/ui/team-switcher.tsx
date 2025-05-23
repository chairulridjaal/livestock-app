"use client"

import * as React from "react"
import { useState } from "react"
import { ChevronsUpDown, Plus } from "lucide-react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
} from "@heroui/react"
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection,
  setDoc,
  updateDoc,
  arrayUnion,
  doc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

function generateJoinCode(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function TeamSwitcher({
  teams,
}: {
  teams: {
    id: string
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const { isMobile } = useSidebar()
  const { user } = useAuth();
  const [activeTeam, setActiveTeam] = React.useState(() => teams[0])
  const { isOpen: isModalOpen, onOpen, onOpenChange } = useDisclosure()
  const [newFarmName, setNewFarmName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approveMessage, setApproveMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();

  if (!user) {
    setError('User not authenticated.');
    setLoading(false);
    return;
  }

    const handleCreateFarm = async () => {
    setLoading(true);
    setError(null);

    try {
      let finalJoinCode = '';
      let isUnique = false;

      while (!isUnique) {
        const potentialCode = generateJoinCode();
        const existing = await getDocs(
          query(collection(db, 'farms'), where('joinCode', '==', potentialCode))
        );
        if (existing.empty) {
          finalJoinCode = potentialCode;
          isUnique = true;
        }
      }

      const farmSnapshot = await getDocs(collection(db, 'farms'));
      let maxNumber = 0;

      farmSnapshot.forEach((doc) => {
        const match = doc.id.match(/^farm-(\d{3})$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNumber) maxNumber = num;
        }
      });

      const nextFarmId = `farm-${(maxNumber + 1).toString().padStart(3, '0')}`;

      const farmRef = doc(db, 'farms', nextFarmId);
      await setDoc(farmRef, {
        owner: user.uid,
        farmName: newFarmName,
        farmId: nextFarmId,
        joinCode: finalJoinCode,
        members: [user.uid],
        createdAt: new Date(),
      });

      const farmInfo = doc(db, 'farms', nextFarmId, "meta", "information");
      await setDoc(farmInfo, {
        farmName: newFarmName,
        joinCode: finalJoinCode,
        createdAt: new Date(),
        location: '',
      });

      await updateDoc(doc(db, 'users', user.uid as string), {
        farms: arrayUnion(farmRef.id),
        currentFarm: farmRef.id,
      });
      setApproveMessage(`Farm "${newFarmName}" created successfully!`);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/');
          }
          return prev - 1;
        });
      }, 1000);
      if (countdown === 0) {
        navigate('/');
        clearInterval(timer);
      }
    } catch (err) {
      setError('Failed to create farm.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFarm = async () => {
    setLoading(true);
    setError(null);

    try {
      const farmQuery = query(collection(db, 'farms'), where('joinCode', '==', joinCode));
      const querySnapshot = await getDocs(farmQuery);

      if (querySnapshot.empty) {
        setError('Farm not found. Please check the code and try again.');
        return;
      }

      const farmDoc = querySnapshot.docs[0];
      const farmData = farmDoc.data();
      const farmId = farmDoc.id;

      if (farmData.members?.includes(user.uid)) {
        setError('You are already a member of this farm.');
        return;
      }

      await updateDoc(doc(db, 'farms', farmId), {
        members: arrayUnion(user.uid),
      });

      await updateDoc(doc(db, 'users', user.uid as string), {
        farms: arrayUnion(farmId),
        currentFarm: farmId,
      });

      navigate('/dashboard');
    } catch (err) {
      setError('Failed to join farm.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // New: control DropdownMenu open state
  const [dropdownOpen, setDropdownOpen] = React.useState(false)

  React.useEffect(() => {
    if (teams.length > 0) {
      setActiveTeam(teams[0])
    }
  }, [teams])

  if (!activeTeam || !activeTeam.logo) {
    return null
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <activeTeam.logo className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{activeTeam.name}</span>
                  <span className="truncate text-xs">{activeTeam.plan}</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Farms
              </DropdownMenuLabel>

              {teams.map((team, index) => (
                <DropdownMenuItem
                  key={team.name}
                  onClick={async () => {
                      setActiveTeam(team); // Update UI state

                      try {
                        if (user.uid) {
                          await updateDoc(doc(db, 'users', user.uid), {
                            currentFarm: team.id,
                          });
                          window.location.reload()
                        } else {
                          console.error('User UID is null.');
                        }
                      } catch (err) {
                        console.error('Failed to switch currentFarm:', err);
                      }
                    }}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <team.logo className="size-4 shrink-0" />
                  </div>
                  {team.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()

                  // 🔒 Close dropdown when opening modal
                  setDropdownOpen(false)

                  onOpen()
                }}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">Add farm</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Modal */}
      <Modal isOpen={isModalOpen} placement="top-center" onClose={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-2xl text-center">
                <h2 className="text-lg font-semibold"></h2>
              </ModalHeader>
              <ModalBody>
                {error && (
                  <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>
                )}
                {approveMessage && (
                  <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md">{approveMessage}</div>
                )}
                <h2 className="text-lg font-semibold"> Create a New Farm </h2>
                <Input
                  id="Farm Name"
                  name="Farm Name"
                  placeholder="Farm Name"
                  variant="bordered"
                  value={newFarmName}
                  onChange={(e) => setNewFarmName(e.target.value)}
                />
                <Button
                  className="w-full"
                  onClick={handleCreateFarm}
                  disabled={loading || !newFarmName}
                >
                  {loading ? 'Creating...' : 'Create Farm'}
                </Button>

                <div className="flex items-center gap-4">
                  <Separator className="flex-1" />
                  <span className="text-muted-foreground text-sm">or</span>
                  <Separator className="flex-1" />
                </div>

                <h2 className="text-lg font-semibold"> Join Farm with a Code </h2>
                <Input
                  id="Join Code"
                  name="Join Code"
                  placeholder="Farm Code"
                  variant="bordered"
                />
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleJoinFarm}
                  >
                    Join Farm
                  </Button>
              </ModalBody>
              <ModalFooter>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

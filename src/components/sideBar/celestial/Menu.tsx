import styled from "styled-components";
import SidebarMenuButton from "@/components/button/sidebarMenu/SidebarMenuButton";
import Todo from "@/assets/icons/Todo";
import Project from "@/assets/icons/Project";
import LoadMap from "@/assets/icons/LoadMap";
import {useRouter} from "next/navigation";
import {useState} from "react";
import CategoryIcon from "@/assets/icons/Category"

interface Category {
    id: string,
    name: string,
    color: string,
    description: string,
    creatorId: string,
    creatorName: string,
}

const Menu = (props: {width:number, categories: Category[]}) => {
    const router = useRouter();

    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    
    return(
        <MenuWrapper>
            <SidebarMenuButton $height={30} $width={props.width-40} label="카테고리"
                               $isDropdown={props.categories.length > 0} $isOpen={isCategoryOpen}
                               $onArrowClick={() => setIsCategoryOpen(!isCategoryOpen)}
                               onClick={() => {router.push("/category")}} >
                <CategoryIcon width={26}/>
            </SidebarMenuButton>

            {isCategoryOpen && props.categories.length > 0 && (
                <CategoryList>
                    {props.categories.map((item) => (
                        <CategoryItem
                            key={item.id}
                            onClick={() => router.push(`/category/${item.id}`)}
                        >
                            <ColorDot $color={item.color}/>
                            <CategoryName>{item.name}</CategoryName>
                        </CategoryItem>
                    ))}
                </CategoryList>
            )}

            <SidebarMenuButton $height={30} $width={props.width-40} label="일정">
                <Todo width={26}/>
            </SidebarMenuButton>
            <SidebarMenuButton $height={30} $width={props.width-40} label="프로젝트">
                <Project width={26}/>
            </SidebarMenuButton>
            <SidebarMenuButton $height={30} $width={props.width-40} label="로드맵">
                <LoadMap width={26}/>
            </SidebarMenuButton>
        </MenuWrapper>
    )
}

const MenuWrapper = styled.div`
    & > * {
        margin-top: 10px;
    }
`

const CategoryList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    padding-left: 10px; 
    margin-top: 4px;
    margin-bottom: 8px;
    
    animation: fadeIn 0.2s ease-in-out;
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

const CategoryName = styled.span`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s ease-in-out;
`;

const CategoryItem = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    
    font-size: 0.9rem;
    color: ${(props) => props.theme.colors.text};
    cursor: pointer;
    border-radius: 6px;
    
    transition: background-color 0.2s ease;

    &:hover ${CategoryName} {
        border-bottom-color: ${(props) => props.theme.colors.text};
    }
`;

const ColorDot = styled.div<{ $color: string }>`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${(props) => props.$color};
    flex-shrink: 0;
    border: 1px solid rgba(0,0,0,0.1);
`;

export default Menu
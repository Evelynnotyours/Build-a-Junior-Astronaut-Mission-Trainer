import { Commander } from './Commander';
import { Hotspot } from './Hotspot';
import { Overlay } from './Overlay';
import { OUTPOST_BUILDINGS, type BuildingSlot } from './outpostLayout';
import type { SceneLayerFlags, SpotId, SpotLayout, UiSettings } from './types';

type SceneStageProps = {
  layers: SceneLayerFlags;
  spots: Record<SpotId, SpotLayout>;
  activeSpot?: SpotId | null;
  hotspotsEnabled?: boolean;
  commander: { x: number; y: number; pose?: 'idle' | 'walk' | 'cheer' | 'concerned' };
  moodTintClassName?: string;
  settings: UiSettings;
  onSelectSpot: (id: SpotId) => void;
  onCommanderArrived?: () => void;
  onSkipWalk?: () => void;
  showSkipWalk?: boolean;
  /**
   * Full-bleed landscape (reference vista). When set, replaces stacked sky/ground/mountain.
   * Building cutouts remain optional via showBuildings.
   */
  backdropSrc?: string;
  showBuildings?: boolean;
};

const SKY: Record<SceneLayerFlags['sky'], string> = {
  day: '/assets/bg/sky_day.png',
  dawn: '/assets/bg/sky_dawn.png',
  dusk: '/assets/bg/sky_dusk.png',
  night: '/assets/bg/sky_night.png',
  dust: '/assets/bg/sky_dust.png',
};

const SOLAR: Record<SceneLayerFlags['solar'], string> = {
  clean: '/assets/buildings/solar_panels_clean.png',
  dusty: '/assets/buildings/solar_panels_dusty.png',
  covered: '/assets/buildings/solar_panels_covered.png',
  damaged: '/assets/buildings/solar_panels_damaged.png',
};

function BuildingSprite({
  src,
  slot,
  className = '',
}: {
  src: string;
  slot: BuildingSlot;
  className?: string;
}) {
  return (
    <img
      className={`ui-scene__prop ${className}`.trim()}
      src={src}
      alt=""
      draggable={false}
      style={{
        left: `${slot.left}%`,
        top: `${slot.top}%`,
        width: `${slot.width}%`,
        zIndex: slot.z,
      }}
    />
  );
}

/** 16:9 outpost stage. Camera transforms should wrap this whole stage so hotspots stay aligned. */
export function SceneStage({
  layers,
  spots,
  activeSpot = null,
  hotspotsEnabled = false,
  commander,
  moodTintClassName,
  settings,
  onSelectSpot,
  onCommanderArrived,
  onSkipWalk,
  showSkipWalk = false,
  backdropSrc,
  showBuildings = !backdropSrc,
}: SceneStageProps) {
  return (
    <div className="ui-scene">
      <div className="ui-scene__stage" role="img" aria-label="Mars outpost">
        {backdropSrc ? (
          <img
            className="ui-scene__layer ui-scene__backdrop"
            src={backdropSrc}
            alt=""
            draggable={false}
          />
        ) : (
          <>
            <img className="ui-scene__layer" src={SKY[layers.sky]} alt="" draggable={false} />
            <img
              className="ui-scene__layer"
              src="/assets/bg/mount_sharp.png"
              alt=""
              draggable={false}
            />
            <img
              className="ui-scene__layer"
              src="/assets/bg/mars_ground.png"
              alt=""
              draggable={false}
            />
          </>
        )}

        {showBuildings ? (
          <div className="ui-scene__props" aria-hidden="true">
            <BuildingSprite
              src="/assets/buildings/greenhouse.png"
              slot={OUTPOST_BUILDINGS.greenhouse}
            />
            <BuildingSprite
              src="/assets/buildings/shelter_closed.png"
              slot={OUTPOST_BUILDINGS.shelter}
              className={layers.shelterOpen ? 'is-hidden' : ''}
            />
            {layers.shelterOpen ? (
              <BuildingSprite
                src="/assets/buildings/shelter_open.png"
                slot={OUTPOST_BUILDINGS.shelter}
              />
            ) : null}
            <BuildingSprite src={SOLAR[layers.solar]} slot={OUTPOST_BUILDINGS.solar} />
            <BuildingSprite src={SOLAR[layers.solar]} slot={OUTPOST_BUILDINGS.solarB} />
            {layers.extraPanels ? (
              <BuildingSprite
                src="/assets/buildings/extra_panels.png"
                slot={OUTPOST_BUILDINGS.extraPanels}
              />
            ) : null}
            <BuildingSprite
              src="/assets/buildings/air_module.png"
              slot={OUTPOST_BUILDINGS.air}
            />
            <BuildingSprite
              src="/assets/buildings/habitat.png"
              slot={OUTPOST_BUILDINGS.habitat}
            />
            <BuildingSprite
              src="/assets/buildings/comms_dish.png"
              slot={OUTPOST_BUILDINGS.dish}
            />
            {layers.shieldPlating ? (
              <BuildingSprite
                src="/assets/buildings/shield_plating.png"
                slot={OUTPOST_BUILDINGS.shieldPlating}
              />
            ) : null}
            {layers.garageOpen ? (
              <BuildingSprite
                src="/assets/buildings/rover_garage_open.png"
                slot={OUTPOST_BUILDINGS.garage}
              />
            ) : null}
            <BuildingSprite
              src="/assets/buildings/outpost_rover.png"
              slot={OUTPOST_BUILDINGS.rover}
            />
            {layers.batteryBox ? (
              <BuildingSprite
                src="/assets/buildings/battery_box.png"
                slot={OUTPOST_BUILDINGS.batteryBox}
              />
            ) : null}
          </div>
        ) : null}

        <Overlay
          kind={layers.frost ? 'frost' : 'none'}
          tintClassName={moodTintClassName}
          reduceMotion={settings.reduceMotion}
        />

        {(Object.keys(spots) as SpotId[]).map((id) => (
          <Hotspot
            key={id}
            id={id}
            layout={spots[id]}
            active={activeSpot === id}
            enabled={hotspotsEnabled}
            reduceMotion={settings.reduceMotion}
            onSelect={onSelectSpot}
          />
        ))}

        <Commander
          x={commander.x}
          y={commander.y}
          pose={commander.pose}
          reduceMotion={settings.reduceMotion}
          onArrived={onCommanderArrived}
        />
      </div>

      {showSkipWalk && onSkipWalk ? (
        <button type="button" className="ui-btn ui-scene__skip" onClick={onSkipWalk}>
          Finish walk
        </button>
      ) : null}
    </div>
  );
}

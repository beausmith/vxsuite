/* Generated by res-to-ts. DO NOT EDIT */
/* eslint-disable */
/* istanbul ignore file */

import { Buffer } from 'buffer';
import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, sep } from 'path';
import { safeParseElectionDefinition } from '@votingworks/types';

/**
 * Data of data/electionMinimalExhaustiveSampleWithReportingUrl/electionMinimalExhaustiveSampleWithReportingUrl.json encoded as base64.
 *
 * SHA-256 hash of file data: 8e534b2e7ccce3e03f5831ad66ac95942c3857357cc2336fd2868543f218432e
 */
const resourceDataBase64 = 'ewogICJ0aXRsZSI6ICJFeGFtcGxlIFByaW1hcnkgRWxlY3Rpb24iLAogICJzdGF0ZSI6ICJTdGF0ZSBvZiBTYW1wbGUiLAogICJjb3VudHkiOiB7CiAgICAiaWQiOiAic2FtcGxlLWNvdW50eSIsCiAgICAibmFtZSI6ICJTYW1wbGUgQ291bnR5IgogIH0sCiAgImRhdGUiOiAiMjAyMS0wOS0wOFQwMDowMDowMC0wODowMCIsCiAgImJhbGxvdExheW91dCI6IHsKICAgICJwYXBlclNpemUiOiAibGV0dGVyIgogIH0sCiAgImRpc3RyaWN0cyI6IFsKICAgIHsKICAgICAgImlkIjogImRpc3RyaWN0LTEiLAogICAgICAibmFtZSI6ICJEaXN0cmljdCAxIgogICAgfQogIF0sCiAgInBhcnRpZXMiOiBbCiAgICB7CiAgICAgICJpZCI6ICIwIiwKICAgICAgIm5hbWUiOiAiTWFtbWFsIiwKICAgICAgImZ1bGxOYW1lIjogIk1hbW1hbCBQYXJ0eSIsCiAgICAgICJhYmJyZXYiOiAiTWEiCiAgICB9LAogICAgewogICAgICAiaWQiOiAiMSIsCiAgICAgICJuYW1lIjogIkZpc2giLAogICAgICAiZnVsbE5hbWUiOiAiRmlzaCBQYXJ0eSIsCiAgICAgICJhYmJyZXYiOiAiRiIKICAgIH0KICBdLAogICJjb250ZXN0cyI6IFsKICAgIHsKICAgICAgImlkIjogImJlc3QtYW5pbWFsLW1hbW1hbCIsCiAgICAgICJkaXN0cmljdElkIjogImRpc3RyaWN0LTEiLAogICAgICAidHlwZSI6ICJjYW5kaWRhdGUiLAogICAgICAic2VjdGlvbiI6ICJTdGF0ZSIsCiAgICAgICJ0aXRsZSI6ICJCZXN0IEFuaW1hbCIsCiAgICAgICJzZWF0cyI6IDEsCiAgICAgICJwYXJ0eUlkIjogIjAiLAogICAgICAiY2FuZGlkYXRlcyI6IFsKICAgICAgICB7CiAgICAgICAgICAiaWQiOiAiaG9yc2UiLAogICAgICAgICAgIm5hbWUiOiAiSG9yc2UiLAogICAgICAgICAgInBhcnR5SWRzIjogWyIwIl0KICAgICAgICB9LAogICAgICAgIHsKICAgICAgICAgICJpZCI6ICJvdHRlciIsCiAgICAgICAgICAibmFtZSI6ICJPdHRlciIsCiAgICAgICAgICAicGFydHlJZHMiOiBbIjAiXQogICAgICAgIH0sCiAgICAgICAgewogICAgICAgICAgImlkIjogImZveCIsCiAgICAgICAgICAibmFtZSI6ICJGb3giLAogICAgICAgICAgInBhcnR5SWRzIjogWyIwIl0KICAgICAgICB9CiAgICAgIF0sCiAgICAgICJhbGxvd1dyaXRlSW5zIjogZmFsc2UKICAgIH0sCiAgICB7CiAgICAgICJpZCI6ICJiZXN0LWFuaW1hbC1maXNoIiwKICAgICAgImRpc3RyaWN0SWQiOiAiZGlzdHJpY3QtMSIsCiAgICAgICJ0eXBlIjogImNhbmRpZGF0ZSIsCiAgICAgICJzZWN0aW9uIjogIlN0YXRlIiwKICAgICAgInRpdGxlIjogIkJlc3QgQW5pbWFsIiwKICAgICAgInNlYXRzIjogMSwKICAgICAgInBhcnR5SWQiOiAiMSIsCiAgICAgICJjYW5kaWRhdGVzIjogWwogICAgICAgIHsKICAgICAgICAgICJpZCI6ICJzZWFob3JzZSIsCiAgICAgICAgICAibmFtZSI6ICJTZWFob3JzZSIsCiAgICAgICAgICAicGFydHlJZHMiOiBbIjEiXQogICAgICAgIH0sCiAgICAgICAgewogICAgICAgICAgImlkIjogInNhbG1vbiIsCiAgICAgICAgICAibmFtZSI6ICJTYWxtb24iLAogICAgICAgICAgInBhcnR5SWRzIjogWyIxIl0KICAgICAgICB9CiAgICAgIF0sCiAgICAgICJhbGxvd1dyaXRlSW5zIjogZmFsc2UKICAgIH0sCiAgICB7CiAgICAgICJpZCI6ICJ6b28tY291bmNpbC1tYW1tYWwiLAogICAgICAiZGlzdHJpY3RJZCI6ICJkaXN0cmljdC0xIiwKICAgICAgInR5cGUiOiAiY2FuZGlkYXRlIiwKICAgICAgInNlY3Rpb24iOiAiQ2l0eSIsCiAgICAgICJ0aXRsZSI6ICJab28gQ291bmNpbCIsCiAgICAgICJzZWF0cyI6IDMsCiAgICAgICJwYXJ0eUlkIjogIjAiLAogICAgICAiY2FuZGlkYXRlcyI6IFsKICAgICAgICB7CiAgICAgICAgICAiaWQiOiAiemVicmEiLAogICAgICAgICAgIm5hbWUiOiAiWmVicmEiLAogICAgICAgICAgInBhcnR5SWRzIjogWyIwIl0KICAgICAgICB9LAogICAgICAgIHsKICAgICAgICAgICJpZCI6ICJsaW9uIiwKICAgICAgICAgICJuYW1lIjogIkxpb24iLAogICAgICAgICAgInBhcnR5SWRzIjogWyIwIl0KICAgICAgICB9LAogICAgICAgIHsKICAgICAgICAgICJpZCI6ICJrYW5nYXJvbyIsCiAgICAgICAgICAibmFtZSI6ICJLYW5nYXJvbyIsCiAgICAgICAgICAicGFydHlJZHMiOiBbIjAiXQogICAgICAgIH0sCiAgICAgICAgewogICAgICAgICAgImlkIjogImVsZXBoYW50IiwKICAgICAgICAgICJuYW1lIjogIkVsZXBoYW50IiwKICAgICAgICAgICJwYXJ0eUlkcyI6IFsiMCJdCiAgICAgICAgfQogICAgICBdLAogICAgICAiYWxsb3dXcml0ZUlucyI6IHRydWUKICAgIH0sCiAgICB7CiAgICAgICJpZCI6ICJhcXVhcml1bS1jb3VuY2lsLWZpc2giLAogICAgICAiZGlzdHJpY3RJZCI6ICJkaXN0cmljdC0xIiwKICAgICAgInR5cGUiOiAiY2FuZGlkYXRlIiwKICAgICAgInNlY3Rpb24iOiAiQ2l0eSIsCiAgICAgICJ0aXRsZSI6ICJab28gQ291bmNpbCIsCiAgICAgICJzZWF0cyI6IDIsCiAgICAgICJwYXJ0eUlkIjogIjEiLAogICAgICAiY2FuZGlkYXRlcyI6IFsKICAgICAgICB7CiAgICAgICAgICAiaWQiOiAibWFudGEtcmF5IiwKICAgICAgICAgICJuYW1lIjogIk1hbnRhIFJheSIsCiAgICAgICAgICAicGFydHlJZHMiOiBbIjEiXQogICAgICAgIH0sCiAgICAgICAgewogICAgICAgICAgImlkIjogInB1ZmZlcmZpc2giLAogICAgICAgICAgIm5hbWUiOiAiUHVmZmVyZmlzaCIsCiAgICAgICAgICAicGFydHlJZHMiOiBbIjEiXQogICAgICAgIH0sCiAgICAgICAgewogICAgICAgICAgImlkIjogInJvY2tmaXNoIiwKICAgICAgICAgICJuYW1lIjogIlJvY2tmaXNoIiwKICAgICAgICAgICJwYXJ0eUlkcyI6IFsiMSJdCiAgICAgICAgfSwKICAgICAgICB7CiAgICAgICAgICAiaWQiOiAidHJpZ2dlcmZpc2giLAogICAgICAgICAgIm5hbWUiOiAiVHJpZ2dlcmZpc2giLAogICAgICAgICAgInBhcnR5SWRzIjogWyIxIl0KICAgICAgICB9CiAgICAgIF0sCiAgICAgICJhbGxvd1dyaXRlSW5zIjogdHJ1ZQogICAgfSwKICAgIHsKICAgICAgImlkIjogIm5ldy16b28tZWl0aGVyLW5laXRoZXIiLAogICAgICAic2VjdGlvbiI6ICJDaXR5IiwKICAgICAgImRpc3RyaWN0SWQiOiAiZGlzdHJpY3QtMSIsCiAgICAgICJ0eXBlIjogIm1zLWVpdGhlci1uZWl0aGVyIiwKICAgICAgInRpdGxlIjogIkJhbGxvdCBNZWFzdXJlIDEiLAogICAgICAicGFydHlJZCI6ICIwIiwKICAgICAgImVpdGhlck5laXRoZXJDb250ZXN0SWQiOiAibmV3LXpvby1laXRoZXIiLAogICAgICAicGlja09uZUNvbnRlc3RJZCI6ICJuZXctem9vLXBpY2siLAogICAgICAiZGVzY3JpcHRpb24iOiAiSW5pdGlhdGl2ZSBNZWFzdXJlIE5vLiAxMiwgU2hvdWxkIFNhbXBsZSBDaXR5IGVzdGFibGlzaCBhIG5ldyBzYWZhcmktc3R5bGUgem9vIGNvc3RpbmcgMiwwMDAsMDAwP1xuXG4gQWx0ZXJuYXRpdmUgTWVhc3VyZSAxMiBBLCBTaG91bGQgU2FtcGxlIENpdHkgZXN0YWJsaXNoIGEgbmV3IHRyYWRpdGlvbmFsIHpvbyBjb3N0aW5nIDEsMDAwLDAwMD8iLAogICAgICAiZWl0aGVyTmVpdGhlckxhYmVsIjogIlZPVEUgRk9SIEFQUFJPVkFMIE9GIEVJVEhFUiwgT1IgQUdBSU5TVCBCT1RIIiwKICAgICAgInBpY2tPbmVMYWJlbCI6ICJBTkQgVk9URSBGT1IgT05FIiwKICAgICAgImVpdGhlck9wdGlvbiI6IHsKICAgICAgICAiaWQiOiAibmV3LXpvby1laXRoZXItYXBwcm92ZWQiLAogICAgICAgICJsYWJlbCI6ICJGT1IgQVBQUk9WQUwgT0YgRUlUSEVSIEluaXRpYXRpdmUgTm8uIDEyIE9SIEFsdGVybmF0aXZlIEluaXRpYXRpdmUgTm8uIDEyIEEiCiAgICAgIH0sCiAgICAgICJuZWl0aGVyT3B0aW9uIjogewogICAgICAgICJpZCI6ICJuZXctem9vLW5laXRoZXItYXBwcm92ZWQiLAogICAgICAgICJsYWJlbCI6ICJBR0FJTlNUIEJPVEggSW5pdGlhdGl2ZSBOby4gMTIgQU5EIEFsdGVybmF0aXZlIE1lYXN1cmUgMTIgQSIKICAgICAgfSwKICAgICAgImZpcnN0T3B0aW9uIjogewogICAgICAgICJpZCI6ICJuZXctem9vLXNhZmFyaSIsCiAgICAgICAgImxhYmVsIjogIkZPUiBJbml0aWF0aXZlIE5vLiAxMiIKICAgICAgfSwKICAgICAgInNlY29uZE9wdGlvbiI6IHsKICAgICAgICAiaWQiOiAibmV3LXpvby10cmFkaXRpb25hbCIsCiAgICAgICAgImxhYmVsIjogIkZPUiBBbHRlcm5hdGl2ZSBNZWFzdXJlIE5vLiAxMiBBIgogICAgICB9CiAgICB9LAogICAgewogICAgICAiaWQiOiAiZmlzaGluZyIsCiAgICAgICJzZWN0aW9uIjogIkNpdHkiLAogICAgICAiZGlzdHJpY3RJZCI6ICJkaXN0cmljdC0xIiwKICAgICAgInR5cGUiOiAieWVzbm8iLAogICAgICAidGl0bGUiOiAiQmFsbG90IE1lYXN1cmUgMyIsCiAgICAgICJwYXJ0eUlkIjogIjEiLAogICAgICAiZGVzY3JpcHRpb24iOiAiU2hvdWxkIGZpc2hpbmcgYmUgYmFubmVkIGluIGFsbCBjaXR5IG93bmVkIGxha2VzIGFuZCByaXZlcnM/IiwKICAgICAgInllc09wdGlvbiI6IHsKICAgICAgICAiaWQiOiAiYmFuLWZpc2hpbmciLAogICAgICAgICJsYWJlbCI6ICJZRVMiCiAgICAgIH0sCiAgICAgICJub09wdGlvbiI6IHsKICAgICAgICAiaWQiOiAiYWxsb3ctZmlzaGluZyIsCiAgICAgICAgImxhYmVsIjogIk5PIgogICAgICB9CiAgICB9CiAgXSwKICAicHJlY2luY3RzIjogWwogICAgewogICAgICAiaWQiOiAicHJlY2luY3QtMSIsCiAgICAgICJuYW1lIjogIlByZWNpbmN0IDEiCiAgICB9LAogICAgewogICAgICAiaWQiOiAicHJlY2luY3QtMiIsCiAgICAgICJuYW1lIjogIlByZWNpbmN0IDIiCiAgICB9CiAgXSwKICAiYmFsbG90U3R5bGVzIjogWwogICAgewogICAgICAiaWQiOiAiMU0iLAogICAgICAicHJlY2luY3RzIjogWyJwcmVjaW5jdC0xIiwgInByZWNpbmN0LTIiXSwKICAgICAgImRpc3RyaWN0cyI6IFsiZGlzdHJpY3QtMSJdLAogICAgICAicGFydHlJZCI6ICIwIgogICAgfSwKICAgIHsKICAgICAgImlkIjogIjJGIiwKICAgICAgInByZWNpbmN0cyI6IFsicHJlY2luY3QtMSIsICJwcmVjaW5jdC0yIl0sCiAgICAgICJkaXN0cmljdHMiOiBbImRpc3RyaWN0LTEiXSwKICAgICAgInBhcnR5SWQiOiAiMSIKICAgIH0KICBdLAogICJxdWlja1Jlc3VsdHNSZXBvcnRpbmdVcmwiOiAiaHR0cHM6Ly9yZXN1bHRzLnZvdGluZy53b3JrcyIsCiAgInNlYWxVcmwiOiAiL3NlYWxzL1NhbXBsZS1TZWFsLnN2ZyIKfQo=';

/**
 * MIME type of data/electionMinimalExhaustiveSampleWithReportingUrl/electionMinimalExhaustiveSampleWithReportingUrl.json.
 */
export const mimeType = 'application/json';

/**
 * Path to a file containing this file's contents.
 *
 * SHA-256 hash of file data: 8e534b2e7ccce3e03f5831ad66ac95942c3857357cc2336fd2868543f218432e
 */
export function asFilePath(): string {
  const directoryPath = mkdtempSync(tmpdir() + sep);
  const filePath = join(directoryPath, 'electionMinimalExhaustiveSampleWithReportingUrl.json');
  writeFileSync(filePath, asBuffer());
  return filePath;
}

/**
 * Convert to a `data:` URL of data/electionMinimalExhaustiveSampleWithReportingUrl/electionMinimalExhaustiveSampleWithReportingUrl.json, suitable for embedding in HTML.
 *
 * SHA-256 hash of file data: 8e534b2e7ccce3e03f5831ad66ac95942c3857357cc2336fd2868543f218432e
 */
export function asDataUrl(): string {
  return `data:${mimeType};base64,${resourceDataBase64}`;
}

/**
 * Raw data of data/electionMinimalExhaustiveSampleWithReportingUrl/electionMinimalExhaustiveSampleWithReportingUrl.json.
 *
 * SHA-256 hash of file data: 8e534b2e7ccce3e03f5831ad66ac95942c3857357cc2336fd2868543f218432e
 */
export function asBuffer(): Buffer {
  return Buffer.from(resourceDataBase64, 'base64');
}

/**
 * Text content of data/electionMinimalExhaustiveSampleWithReportingUrl/electionMinimalExhaustiveSampleWithReportingUrl.json.
 *
 * SHA-256 hash of file data: 8e534b2e7ccce3e03f5831ad66ac95942c3857357cc2336fd2868543f218432e
 */
export function asText(): string {
  return asBuffer().toString('utf-8');
}

/**
 * Full election definition for data/electionMinimalExhaustiveSampleWithReportingUrl/electionMinimalExhaustiveSampleWithReportingUrl.json.
 *
 * SHA-256 hash of file data: 8e534b2e7ccce3e03f5831ad66ac95942c3857357cc2336fd2868543f218432e
 */
export const electionDefinition = safeParseElectionDefinition(
  asText()
).unsafeUnwrap();

/**
 * Election definition for data/electionMinimalExhaustiveSampleWithReportingUrl/electionMinimalExhaustiveSampleWithReportingUrl.json.
 *
 * SHA-256 hash of file data: 8e534b2e7ccce3e03f5831ad66ac95942c3857357cc2336fd2868543f218432e
 */
export const election = electionDefinition.election;